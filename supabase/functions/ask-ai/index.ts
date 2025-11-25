import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.14.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configurações da IA
env.useBrowserCache = false;
env.allowLocalModels = false;
env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.14.0/dist/';
env.backends.onnx.wasm.numThreads = 1;

class EmbeddingPipeline {
  static task = 'feature-extraction';
  static model = 'Supabase/gte-small';
  static instance: any = null;

  static async getInstance() {
    if (this.instance === null) {
      console.log("Carregando modelo GTE-Small (WASM)...");
      this.instance = await pipeline(this.task, this.model);
    }
    return this.instance;
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, userName, filter_condominio_id } = await req.json()
    
    // 1. Gerar Embedding da Pergunta
    const generateEmbedding = await EmbeddingPipeline.getInstance();
    const output = await generateEmbedding(query, { pooling: 'mean', normalize: true });
    const embedding = Array.from(output.data);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // 2. Buscar Fragmentos (Chunks) Relevantes
    // Nota: A função RPC 'match_documents' precisa existir no banco.
    // Vamos pedir 5 fragmentos com similaridade > 0.75 (bem estrito)
    const { data: documents, error: matchError } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.75, 
      match_count: 5,
      filter_condominio_id: filter_condominio_id // Passar filtro de condomínio se a RPC suportar
    })

    if (matchError) throw matchError

    let answer = ''

    if (!documents || documents.length === 0) {
      // Fallback com limiar menor se não achar nada muito específico
      const { data: fallbackDocs } = await supabase.rpc('match_documents', {
        query_embedding: embedding,
        match_threshold: 0.60,
        match_count: 3,
        filter_condominio_id: filter_condominio_id
      })
      
      if (!fallbackDocs || fallbackDocs.length === 0) {
         answer = `Olá ${userName}, pesquisei nos documentos mas não encontrei uma resposta específica. Tente reformular sua dúvida.`
      } else {
         const topDoc = fallbackDocs[0]
         answer = `Encontrei algo que pode ajudar em **${topDoc.metadata?.source || 'Documentos'}**:\n\n"${topDoc.content}"`
      }
    } else {
      // Monta resposta com os melhores fragmentos
      const topDoc = documents[0]
      const source = topDoc.metadata?.source || 'Regimento'
      
      // Se for um chunk muito pequeno, tenta pegar mais contexto
      answer = `De acordo com o **${source}**:\n\n"${topDoc.content}"`
      
      if (documents.length > 1 && documents[1].metadata?.source === source) {
         answer += `\n\nAlém disso: "${documents[1].content}"`
      }
    }

    return new Response(
      JSON.stringify({ answer }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error("Erro:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})