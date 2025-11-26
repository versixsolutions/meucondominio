import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, userName, filter_condominio_id } = await req.json()

    if (!query) {
      throw new Error('Query não fornecida')
    }

    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')
    const QDRANT_URL = Deno.env.get('QDRANT_URL')
    const QDRANT_API_KEY = Deno.env.get('QDRANT_API_KEY')
    const COLLECTION_NAME = Deno.env.get('QDRANT_COLLECTION_NAME') || 'norma_knowledge_base'

    if (!GROQ_API_KEY || !QDRANT_URL) {
      throw new Error('Configurações ausentes')
    }

    console.log(`🔍 Query: "${query}"`)
    console.log(`🏢 Condomínio: ${filter_condominio_id}`)

    // ===== ESTRATÉGIA NOVA: BUSCA HÍBRIDA (Texto + Semântica) =====
    // Qdrant suporta busca por texto sem precisar de embeddings externos
    
    const searchPayload = {
      query: {
        fusion: "rrf", // Ranked Reciprocal Fusion (combina busca semântica + texto)
        prefetch: [
          {
            // Busca 1: Por texto (BM25)
            query: {
              text: query
            },
            using: "text",
            limit: 10
          },
          {
            // Busca 2: Por semântica (se tiver embeddings)
            query: {
              text: query
            },
            using: "dense",
            limit: 10
          }
        ]
      },
      limit: 5,
      with_payload: true,
      score_threshold: 0.5,
      filter: {
        must: [
          {
            key: "condominio_id",
            match: { value: filter_condominio_id }
          }
        ]
      }
    }

    console.log('🔎 Buscando no Qdrant...')

    const searchResp = await fetch(
      `${QDRANT_URL}/collections/${COLLECTION_NAME}/points/query`,
      {
        method: 'POST',
        headers: {
          'api-key': QDRANT_API_KEY!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchPayload)
      }
    )

    if (!searchResp.ok) {
      const errorText = await searchResp.text()
      console.error('❌ Qdrant Error:', errorText)
      
      // FALLBACK: Busca simples por scroll (se a busca híbrida falhar)
      console.log('⚠️ Tentando busca alternativa...')
      
      const fallbackResp = await fetch(
        `${QDRANT_URL}/collections/${COLLECTION_NAME}/points/scroll`,
        {
          method: 'POST',
          headers: {
            'api-key': QDRANT_API_KEY!,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            filter: {
              must: [
                {
                  key: "condominio_id",
                  match: { value: filter_condominio_id }
                }
              ]
            },
            limit: 10,
            with_payload: true
          })
        }
      )

      if (!fallbackResp.ok) {
        throw new Error('Falha na busca no Qdrant')
      }

      const fallbackData = await fallbackResp.json()
      const allPoints = fallbackData.result?.points || []
      
      // Filtrar manualmente por palavras-chave
      const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 3)
      const rankedResults = allPoints
        .map((point: any) => {
          const content = point.payload.content.toLowerCase()
          const score = queryWords.reduce((acc: number, word: string) => {
            return acc + (content.includes(word) ? 1 : 0)
          }, 0)
          return { ...point, score: score / queryWords.length }
        })
        .filter((r: any) => r.score > 0.3)
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 5)

      if (rankedResults.length === 0) {
        return new Response(
          JSON.stringify({
            answer: 'Não encontrei informações sobre isso nos documentos do condomínio. Você pode reformular a pergunta ou verificar se os documentos relevantes foram adicionados na Biblioteca.',
            sources: []
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      console.log(`📊 Busca alternativa: ${rankedResults.length} resultados`)

      // Continuar com os resultados do fallback
      const contextParts = rankedResults.map((r: any, i: number) => {
        const source = r.payload.title || 'Documento'
        return `[Fonte ${i + 1}: ${source}]\n${r.payload.content}`
      })

      const contextText = contextParts.join('\n\n---\n\n')

      // PROMPT ENGINEERING
      const systemPrompt = `Você é a Norma, assistente virtual de gestão condominial.

**INSTRUÇÕES CRÍTICAS:**
1. Responda APENAS com base no CONTEXTO fornecido abaixo
2. Se a informação NÃO estiver no contexto, diga: "Não encontrei essa informação nos documentos disponíveis"
3. Seja concisa e objetiva (máximo 150 palavras)
4. Use bullets quando listar múltiplos itens
5. Cite a fonte quando possível (ex: "Segundo o Regimento Interno...")
6. Fale em português do Brasil, de forma profissional mas acessível

**CONTEXTO:**
${contextText}

**IMPORTANTE:** Não invente informações. Se não souber, admita.`

      console.log('🤖 Chamando Groq...')

      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query }
          ],
          temperature: 0.1,
          max_tokens: 500
        })
      })

      if (!groqResponse.ok) {
        throw new Error(`Groq API falhou: ${await groqResponse.text()}`)
      }

      const groqData = await groqResponse.json()
      const answer = groqData.choices?.[0]?.message?.content || 'Erro ao gerar resposta'

      console.log(`✅ Resposta gerada`)

      return new Response(
        JSON.stringify({
          answer,
          sources: rankedResults.map((r: any) => ({
            title: r.payload.title,
            score: r.score,
            excerpt: r.payload.content.substring(0, 150) + '...'
          }))
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Se a busca híbrida funcionou
    const searchData = await searchResp.json()
    const hits = searchData.points || []

    console.log(`📊 Encontrados ${hits.length} resultados`)

    if (hits.length === 0) {
      return new Response(
        JSON.stringify({
          answer: 'Não encontrei informações sobre isso nos documentos do condomínio. Você pode reformular a pergunta ou verificar se os documentos relevantes foram adicionados na Biblioteca.',
          sources: []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // RE-RANKING
    const rankedResults = hits
      .filter((r: any) => r.score > 0.5)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 3)

    console.log(`⭐ Top resultado: score=${rankedResults[0]?.score.toFixed(3)}`)

    // MONTAR CONTEXTO
    const contextParts = rankedResults.map((r: any, i: number) => {
      const source = r.payload.title || 'Documento'
      return `[Fonte ${i + 1}: ${source}]\n${r.payload.content}`
    })

    const contextText = contextParts.join('\n\n---\n\n')

    console.log(`💬 Contexto: ${contextText.length} caracteres`)

    // PROMPT ENGINEERING
    const systemPrompt = `Você é a Norma, assistente virtual de gestão condominial.

**INSTRUÇÕES CRÍTICAS:**
1. Responda APENAS com base no CONTEXTO fornecido abaixo
2. Se a informação NÃO estiver no contexto, diga: "Não encontrei essa informação nos documentos disponíveis"
3. Seja concisa e objetiva (máximo 150 palavras)
4. Use bullets quando listar múltiplos itens
5. Cite a fonte quando possível (ex: "Segundo o Regimento Interno...")
6. Fale em português do Brasil, de forma profissional mas acessível

**CONTEXTO:**
${contextText}

**IMPORTANTE:** Não invente informações. Se não souber, admita.`

    console.log('🤖 Chamando Groq...')

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.1,
        max_tokens: 500
      })
    })

    if (!groqResponse.ok) {
      throw new Error(`Groq API falhou: ${await groqResponse.text()}`)
    }

    const groqData = await groqResponse.json()
    const answer = groqData.choices?.[0]?.message?.content || 'Erro ao gerar resposta'

    console.log(`✅ Resposta gerada (${answer.length} caracteres)`)

    return new Response(
      JSON.stringify({
        answer,
        sources: rankedResults.map((r: any) => ({
          title: r.payload.title,
          score: r.score,
          excerpt: r.payload.content.substring(0, 150) + '...'
        }))
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error: any) {
    console.error('❌ Erro:', error)
    return new Response(
      JSON.stringify({
        answer: `Erro técnico: ${error.message}. Por favor, tente novamente.`,
        sources: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})