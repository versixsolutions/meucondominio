import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configuração do Gemini
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_EMBED_URL = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`;
const GEMINI_CHAT_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, text, query, userName, filter_condominio_id } = await req.json()
    
    if (!GEMINI_API_KEY) throw new Error("API Key do Gemini não configurada.");

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // --- AÇÃO 1: GERAR EMBEDDING (Para salvar documentos) ---
    if (action === 'embed') {
        const response = await fetch(GEMINI_EMBED_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "models/text-embedding-004",
                content: { parts: [{ text: text }] }
            })
        });
        const data = await response.json();
        const embedding = data.embedding.values;
        
        return new Response(JSON.stringify({ embedding }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // --- AÇÃO 2: RESPONDER PERGUNTA (Chat) ---
    if (query) {
        // 1. Gerar vetor da pergunta
        const embedResponse = await fetch(GEMINI_EMBED_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "models/text-embedding-004",
                content: { parts: [{ text: query }] }
            })
        });
        const embedData = await embedResponse.json();
        const queryEmbedding = embedData.embedding.values;

        // 2. Buscar documentos similares no Supabase
        // Nota: O modelo do Gemini tem 768 dimensões. Precisamos ajustar a tabela 'documents' se ela ainda for 384.
        // Vou assumir que você rodará o SQL de migração para 768.
        const { data: documents, error: matchError } = await supabase.rpc('match_documents', {
            query_embedding: queryEmbedding,
            match_threshold: 0.5, // Gemini embeddings podem ter escalas diferentes, ajustável
            match_count: 5,
            filter_condominio_id: filter_condominio_id
        });

        if (matchError) throw matchError;

        // 3. Montar Contexto para o Gemini
        let contextText = "";
        if (documents && documents.length > 0) {
            contextText = documents.map((d: any) => `[Trecho do documento '${d.metadata?.source || 'Oficial'}']: ${d.content}`).join("\n\n");
        } else {
            contextText = "Não foram encontrados documentos específicos sobre este tema na base de conhecimento.";
        }

        // 4. Perguntar ao Gemini
        const prompt = `
          Você é a Norma, assistente virtual do condomínio.
          Responda à pergunta do morador ${userName || ''} com base APENAS no contexto abaixo.
          
          Contexto:
          ${contextText}

          Pergunta do morador: "${query}"

          Instruções:
          - Seja educada e direta.
          - Se a resposta estiver no contexto, cite a fonte (ex: "Segundo o Artigo X...").
          - Se a resposta NÃO estiver no contexto, diga que não encontrou a informação nos documentos oficiais, mas não invente regras.
        `;

        const chatResponse = await fetch(GEMINI_CHAT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const chatData = await chatResponse.json();
        const answer = chatData.candidates?.[0]?.content?.parts?.[0]?.text || "Desculpe, tive um erro ao processar sua resposta.";

        return new Response(JSON.stringify({ answer }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    throw new Error("Ação inválida.");

  } catch (error: any) {
    console.error("Erro na Edge Function:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})