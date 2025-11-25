import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
// Usando versão estável v1beta
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

serve(async (req: Request) => {
  // 1. Tratamento de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Validação de Configuração (Crucial para evitar erro 500 silencioso)
    if (!GEMINI_API_KEY) {
      console.error("ERRO CRÍTICO: GEMINI_API_KEY não encontrada.");
      throw new Error("Configuração de API ausente no servidor.");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error("ERRO CRÍTICO: Variáveis do Supabase ausentes.");
      throw new Error("Configuração do banco de dados ausente.");
    }

    // 3. Parse do Corpo da Requisição
    let body;
    try {
      body = await req.json();
    } catch (e) {
      throw new Error("Corpo da requisição inválido (JSON malformado).");
    }

    const { action, text, query, userName, filter_condominio_id } = body;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // --- AÇÃO 1: GERAR EMBEDDING (UPLOAD) ---
    if (action === 'embed') {
        if (!text) throw new Error("Texto para embedding não fornecido.");

        console.log(`Gerando embedding para texto de ${text.length} caracteres...`);
        
        const response = await fetch(`${API_BASE}/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "models/text-embedding-004",
                content: { parts: [{ text: text }] }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Erro Gemini Embed:", errText);
            throw new Error(`Google API Error: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        if (!data.embedding?.values) {
            console.error("Resposta Gemini inesperada:", data);
            throw new Error("A API do Google não retornou vetores.");
        }

        return new Response(JSON.stringify({ embedding: data.embedding.values }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // --- AÇÃO 2: CHAT ---
    if (query) {
        console.log(`Processando pergunta: "${query}"`);

        // A. Embedding da Pergunta
        const embedResponse = await fetch(`${API_BASE}/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "models/text-embedding-004",
                content: { parts: [{ text: query }] }
            })
        });

        if (!embedResponse.ok) {
            const err = await embedResponse.text();
            console.error("Erro Embed Query:", err);
            throw new Error(`Erro ao processar pergunta: ${err}`);
        }
        
        const embedData = await embedResponse.json();
        const queryEmbedding = embedData.embedding?.values;

        if (!queryEmbedding) throw new Error("Falha ao vetorizar a pergunta.");

        // B. Busca no Banco
        // Nota: Se der erro aqui, é provável que o SQL de 768 dimensões não tenha sido aplicado
        const { data: documents, error: matchError } = await supabase.rpc('match_documents', {
            query_embedding: queryEmbedding,
            match_threshold: 0.3, 
            match_count: 5,
            filter_condominio_id: filter_condominio_id
        });

        if (matchError) {
            console.error("Erro RPC Supabase:", matchError);
            throw new Error(`Erro interno no banco de dados: ${matchError.message}`);
        }

        console.log(`Documentos recuperados: ${documents?.length || 0}`);

        // C. Montagem do Contexto
        let contextText = "";
        if (documents && documents.length > 0) {
            contextText = documents.map((d: any) => `--- INÍCIO TRECHO ---\n${d.content}\n--- FIM TRECHO ---`).join("\n\n");
        } else {
            contextText = "Nenhuma informação encontrada nos documentos oficiais.";
        }

        // D. Geração da Resposta
        const prompt = `
          Você é a Norma, assistente virtual do condomínio.
          
          CONTEXTO DOS DOCUMENTOS:
          ${contextText}

          PERGUNTA DO USUÁRIO (${userName || 'Morador'}): 
          "${query}"

          INSTRUÇÕES:
          - Responda usando APENAS o contexto acima.
          - Se a resposta estiver no contexto, seja gentil e direta.
          - Se não encontrar a informação no contexto, diga: "Desculpe, não encontrei essa informação nos documentos do condomínio." e sugira abrir um chamado.
          - Não invente informações.
        `;

        const chatResponse = await fetch(`${API_BASE}/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!chatResponse.ok) {
             const err = await chatResponse.text();
             console.error("Erro Chat Gemini:", err);
             throw new Error(`Erro na geração de texto: ${err}`);
        }

        const chatData = await chatResponse.json();
        const answer = chatData.candidates?.[0]?.content?.parts?.[0]?.text || "Não consegui formular uma resposta.";

        return new Response(JSON.stringify({ answer }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: "Nenhuma ação válida fornecida." }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error("ERRO FATAL NA FUNCTION:", error.message);
    
    // Retorna JSON com erro 500 explícito, mas legível pelo frontend
    return new Response(
        JSON.stringify({ 
            error: error.message,
            details: "Verifique os logs da Edge Function no painel Supabase."
        }), 
        { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
    )
  }
})