import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
  // CRÍTICO: Sempre responder OPTIONS primeiro
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

    // Aguardar processamento (máximo 60 segundos)
    let markdown = ''
    let attempts = 0
    const maxAttempts = 30

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)) // 2 segundos

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

    // ===== RETORNAR RESULTADO =====
    return new Response(
      JSON.stringify({
        success: true,
        markdown: markdown,
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