import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Função de chunking
function splitMarkdownIntoChunks(
  markdown: string,
  docTitle: string,
  chunkSize: number = 1000,
  overlap: number = 200
): Array<{ content: string, chunk_number: number }> {
  const sectionRegex = /(?=\n#{1,3}\s+)|(?=\n\*\*\s*Artigo)/
  const rawSections = markdown.split(sectionRegex)
  
  const chunks: Array<{ content: string, chunk_number: number }> = []
  let currentChunk = `Documento: ${docTitle}\n\n`
  let chunkNumber = 0

  for (const section of rawSections) {
    const trimmedSection = section.trim()
    
    if (trimmedSection.length < 50) continue

    if (currentChunk.length + trimmedSection.length > chunkSize && currentChunk.length > 100) {
      chunks.push({
        content: currentChunk.trim(),
        chunk_number: chunkNumber
      })
      
      const words = currentChunk.split(' ')
      const overlapWords = words.slice(-Math.floor(overlap / 5)).join(' ')
      
      currentChunk = `Documento: ${docTitle}\n\n${overlapWords}\n\n${trimmedSection}\n\n`
      chunkNumber++
    } else {
      currentChunk += `${trimmedSection}\n\n`
    }
  }

  if (currentChunk.trim().length > 100) {
    chunks.push({
      content: currentChunk.trim(),
      chunk_number: chunkNumber
    })
  }

  if (chunks.length === 0) {
    const text = `Documento: ${docTitle}\n\n${markdown}`
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      chunks.push({
        content: text.slice(i, i + chunkSize),
        chunk_number: Math.floor(i / (chunkSize - overlap))
      })
    }
  }

  return chunks
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200 
    })
  }

  try {
    console.log('📥 Requisição recebida')
    
    const formData = await req.formData()
    const file = formData.get('file') as File
    const condominioId = formData.get('condominio_id') as string
    const category = formData.get('category') as string || 'geral'

    if (!file) {
      throw new Error('Nenhum arquivo enviado')
    }

    console.log(`📄 Arquivo: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`)

    // ===== PASSO 1: PROCESSAR PDF COM LLAMAPARSE =====
    const LLAMAPARSE_API_KEY = Deno.env.get('LLAMAPARSE_API_KEY')
    
    if (!LLAMAPARSE_API_KEY) {
      console.error('❌ LLAMAPARSE_API_KEY não configurada')
      throw new Error('Configuração incompleta: LLAMAPARSE_API_KEY ausente')
    }

    console.log('📤 Enviando para LlamaParse...')

    const parseFormData = new FormData()
    parseFormData.append('file', file)
    parseFormData.append('result_type', 'markdown')
    parseFormData.append('language', 'pt')

    const parseResponse = await fetch('https://api.cloud.llamaindex.ai/api/parsing/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LLAMAPARSE_API_KEY}`
      },
      body: parseFormData
    })

    if (!parseResponse.ok) {
      const errorText = await parseResponse.text()
      console.error('❌ LlamaParse Error:', errorText)
      throw new Error(`LlamaParse falhou: ${errorText}`)
    }

    const parseData = await parseResponse.json()
    const jobId = parseData.id

    console.log(`⏳ Job ID: ${jobId} - Aguardando processamento...`)

    // Aguardar processamento
    let markdown = ''
    let attempts = 0
    const maxAttempts = 30

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const resultResponse = await fetch(
        `https://api.cloud.llamaindex.ai/api/parsing/job/${jobId}/result/markdown`,
        {
          headers: {
            'Authorization': `Bearer ${LLAMAPARSE_API_KEY}`
          }
        }
      )

      if (resultResponse.ok) {
        const result = await resultResponse.json()
        markdown = result.markdown
        console.log('✅ Markdown extraído')
        break
      }

      attempts++
      console.log(`⏳ Tentativa ${attempts}/${maxAttempts}`)
    }

    if (!markdown || markdown.length < 50) {
      throw new Error('Falha ao extrair texto do PDF após timeout')
    }

    console.log(`📝 Texto extraído: ${markdown.length} caracteres`)

    // ===== PASSO 2: QUEBRAR EM CHUNKS =====
    const chunks = splitMarkdownIntoChunks(markdown, file.name.replace('.pdf', ''))
    console.log(`📦 Gerados ${chunks.length} chunks`)

    // ===== PASSO 3: INDEXAR NO QDRANT (COM TEXTO, SEM EMBEDDINGS) =====
    const QDRANT_URL = Deno.env.get('QDRANT_URL')
    const QDRANT_API_KEY = Deno.env.get('QDRANT_API_KEY')
    const COLLECTION_NAME = Deno.env.get('QDRANT_COLLECTION_NAME') || 'norma_knowledge_base'

    if (QDRANT_URL && QDRANT_API_KEY) {
      console.log('📊 Indexando no Qdrant...')
      
      const timestamp = Date.now()
      const points = chunks.map((chunk, i) => ({
        id: `${condominioId}-${timestamp}-${i}`,
        payload: {
          content: chunk.content,
          title: file.name,
          condominio_id: condominioId,
          category: category,
          chunk_number: chunk.chunk_number,
          total_chunks: chunks.length,
          created_at: new Date().toISOString()
        }
      }))

      try {
        const upsertResponse = await fetch(
          `${QDRANT_URL}/collections/${COLLECTION_NAME}/points`,
          {
            method: 'PUT',
            headers: {
              'api-key': QDRANT_API_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ points })
          }
        )

        if (upsertResponse.ok) {
          console.log(`✅ ${points.length} pontos indexados no Qdrant`)
        } else {
          const errorText = await upsertResponse.text()
          console.warn(`⚠️ Falha ao indexar no Qdrant: ${errorText}`)
          console.warn('⚠️ Continuando sem indexação...')
        }
      } catch (qdrantError: any) {
        console.warn(`⚠️ Erro no Qdrant: ${qdrantError.message}`)
        console.warn('⚠️ Continuando sem indexação...')
      }
    } else {
      console.log('⚠️ Qdrant não configurado, pulando indexação')
    }

    // ===== RETORNAR RESULTADO =====
    return new Response(
      JSON.stringify({
        success: true,
        markdown: markdown,
        chunks_created: chunks.length,
        file_name: file.name,
        message: 'PDF processado com sucesso'
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200
      }
    )

  } catch (error: any) {
    console.error('❌ Erro completo:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: error.toString()
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )
  }
})