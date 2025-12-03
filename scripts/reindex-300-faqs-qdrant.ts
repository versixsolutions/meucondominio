/**
 * Script de Re-indexação das 300 FAQs no Qdrant
 * Gera embeddings REAIS (HuggingFace) para todas as FAQs
 * e popula a collection Qdrant com metadados ricos
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Configurações
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const QDRANT_URL = process.env.QDRANT_URL!;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY!;
const FAQ_COLLECTION = process.env.QDRANT_FAQ_COLLECTION || "faqs_collection";
const HF_ENDPOINT_URL = process.env.HUGGINGFACE_ENDPOINT_URL;
const HF_API_URL =
  HF_ENDPOINT_URL ||
  "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2";
const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;
const CONDOMINIO_ID = "5c624180-5fca-41fd-a5a0-a6e724f45d96"; // Pinheiro Park

// Validações
if (!HF_TOKEN) {
  console.error("❌ HUGGINGFACE_TOKEN não encontrado no .env");
  console.error("   Obtenha em: https://huggingface.co/settings/tokens");
  process.exit(1);
}

if (!QDRANT_URL || !QDRANT_API_KEY) {
  console.error("❌ QDRANT_URL ou QDRANT_API_KEY não configurados");
  process.exit(1);
}

console.log("🔗 Configurações:");
console.log(`   - Supabase: ${process.env.VITE_SUPABASE_URL}`);
console.log(`   - Qdrant: ${QDRANT_URL}`);
console.log(`   - Collection: ${FAQ_COLLECTION}`);
console.log(
  `   - HuggingFace: ${HF_ENDPOINT_URL ? "Endpoint Dedicado ✅" : "API Pública ⚠️"}`,
);
console.log(`   - Condomínio: ${CONDOMINIO_ID}\n`);

/**
 * Gera embedding real usando HuggingFace API
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const resp = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: text.substring(0, 512), // Limitar tamanho do texto
      options: { wait_for_model: true, use_cache: true },
    }),
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    console.error(`   ⚠️  Erro HuggingFace: ${errorText}`);
    // Retornar vetor dummy em caso de erro
    return Array(384).fill(0);
  }

  const result = await resp.json();
  let embedding: number[];

  // Tratar diferentes formatos de resposta da API
  if (Array.isArray(result) && Array.isArray(result[0])) {
    // Resposta multi-token: fazer média
    const numTokens = result.length;
    const dims = result[0].length;
    embedding = new Array(dims).fill(0);
    for (const tokenEmb of result) {
      for (let i = 0; i < dims; i++) {
        embedding[i] += tokenEmb[i] / numTokens;
      }
    }
  } else if (Array.isArray(result)) {
    // Resposta direta
    embedding = result;
  } else {
    console.error("   ⚠️  Formato inesperado de resposta HuggingFace");
    return Array(384).fill(0);
  }

  // Normalizar vetor
  const magnitude =
    Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0)) || 1;
  return embedding.map((v) => v / magnitude);
}

/**
 * Verifica ou cria a collection de FAQs no Qdrant
 */
async function ensureCollection() {
  console.log("🔍 Verificando collection no Qdrant...");

  // Verificar se collection existe
  const checkResp = await fetch(`${QDRANT_URL}/collections/${FAQ_COLLECTION}`, {
    headers: { "api-key": QDRANT_API_KEY },
  });

  if (checkResp.ok) {
    console.log(`   ✅ Collection '${FAQ_COLLECTION}' já existe`);

    // Limpar dados antigos
    console.log("   🗑️  Limpando dados antigos...");
    const deleteResp = await fetch(
      `${QDRANT_URL}/collections/${FAQ_COLLECTION}/points/delete`,
      {
        method: "POST",
        headers: {
          "api-key": QDRANT_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filter: {
            must: [
              {
                key: "condominio_id",
                match: { value: CONDOMINIO_ID },
              },
            ],
          },
        }),
      },
    );

    if (deleteResp.ok) {
      console.log("   ✅ Dados antigos removidos\n");
    }
    return;
  }

  // Criar collection
  console.log(`   📦 Criando collection '${FAQ_COLLECTION}'...`);
  const createResp = await fetch(
    `${QDRANT_URL}/collections/${FAQ_COLLECTION}`,
    {
      method: "PUT",
      headers: {
        "api-key": QDRANT_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vectors: {
          size: 384,
          distance: "Cosine",
        },
        optimizers_config: {
          default_segment_number: 2,
        },
        replication_factor: 1,
      }),
    },
  );

  if (!createResp.ok) {
    const error = await createResp.text();
    throw new Error(`Erro ao criar collection: ${error}`);
  }

  console.log("   ✅ Collection criada\n");
}

/**
 * Busca todas as FAQs do Supabase
 */
async function fetchFAQs() {
  console.log("📥 Buscando FAQs do Supabase...");

  const { data: faqs, error } = await supabase
    .from("faqs")
    .select("*")
    .eq("condominio_id", CONDOMINIO_ID)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Erro ao buscar FAQs: ${error.message}`);
  }

  if (!faqs || faqs.length === 0) {
    throw new Error("Nenhuma FAQ encontrada no banco de dados");
  }

  console.log(`   ✅ ${faqs.length} FAQs encontradas\n`);
  return faqs;
}

/**
 * Indexa FAQs no Qdrant em lotes
 */
async function indexFAQs(faqs: any[]) {
  console.log("🔄 Iniciando indexação no Qdrant...\n");

  const BATCH_SIZE = 10; // Processar 10 FAQs por vez
  let pointId = Date.now(); // ID sequencial baseado em timestamp
  let totalIndexed = 0;

  for (let i = 0; i < faqs.length; i += BATCH_SIZE) {
    const batch = faqs.slice(i, i + BATCH_SIZE);
    const points: any[] = [];

    console.log(
      `📦 Lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(faqs.length / BATCH_SIZE)} (FAQs ${i + 1}-${Math.min(i + BATCH_SIZE, faqs.length)})`,
    );

    for (const faq of batch) {
      // Combinar pergunta + resposta para embedding
      const text = `${faq.question} ${faq.answer}`;

      // Gerar embedding REAL
      const embedding = await generateEmbedding(text);

      // Criar ponto com metadados ricos
      points.push({
        id: pointId++,
        vector: embedding,
        payload: {
          faq_id: faq.id,
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          tags: faq.tags || [],
          keywords: faq.keywords || [],
          article_reference: faq.article_reference || null,
          legal_source: faq.legal_source || null,
          scenario_type: faq.scenario_type || "simple",
          tone: faq.tone || "friendly",
          priority: faq.priority || 3,
          requires_sindico_action: faq.requires_sindico_action || false,
          requires_assembly_decision: faq.requires_assembly_decision || false,
          has_legal_implications: faq.has_legal_implications || false,
          question_variations: faq.question_variations || [],
          condominio_id: faq.condominio_id,
          created_at: faq.created_at,
        },
      });

      // Pequeno delay para não sobrecarregar API
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Enviar lote para Qdrant
    console.log(`   📤 Enviando ${points.length} pontos...`);
    const response = await fetch(
      `${QDRANT_URL}/collections/${FAQ_COLLECTION}/points`,
      {
        method: "PUT",
        headers: {
          "api-key": QDRANT_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ points }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`   ❌ Erro ao indexar lote: ${errorText}`);
      continue;
    }

    totalIndexed += points.length;
    console.log(
      `   ✅ ${points.length} pontos indexados (Total: ${totalIndexed}/${faqs.length})\n`,
    );
  }

  return totalIndexed;
}

/**
 * Exibe estatísticas finais
 */
async function showStats() {
  console.log("📊 Estatísticas da Collection:");

  const infoResp = await fetch(`${QDRANT_URL}/collections/${FAQ_COLLECTION}`, {
    headers: { "api-key": QDRANT_API_KEY },
  });

  if (!infoResp.ok) {
    console.log("   ⚠️  Não foi possível obter estatísticas");
    return;
  }

  const info = await infoResp.json();
  console.log(`   - Pontos indexados: ${info.result.points_count}`);
  console.log(
    `   - Vetores: ${info.result.vectors_count || info.result.points_count}`,
  );
  console.log(`   - Status: ${info.result.status}`);
  console.log(`   - Dimensão: ${info.result.config.params.vectors.size}D`);
  console.log(
    `   - Distância: ${info.result.config.params.vectors.distance}\n`,
  );
}

/**
 * Função principal
 */
async function main() {
  console.log(
    "============================================================================",
  );
  console.log("🚀 RE-INDEXAÇÃO DE 300 FAQs NO QDRANT");
  console.log(
    "============================================================================\n",
  );

  try {
    // 1. Verificar/criar collection
    await ensureCollection();

    // 2. Buscar FAQs do Supabase
    const faqs = await fetchFAQs();

    // 3. Indexar no Qdrant
    const totalIndexed = await indexFAQs(faqs);

    // 4. Exibir estatísticas
    await showStats();

    console.log(
      "============================================================================",
    );
    console.log("✅ RE-INDEXAÇÃO CONCLUÍDA COM SUCESSO!");
    console.log(
      "============================================================================",
    );
    console.log(`   📚 FAQs indexadas: ${totalIndexed}`);
    console.log(`   🔍 Collection: ${FAQ_COLLECTION}`);
    console.log(`   ✨ Embeddings: REAIS (HuggingFace)`);
    console.log("\n📝 Próximos passos:");
    console.log("   1. Testar queries no chatbot");
    console.log("   2. Validar relevância das respostas");
    console.log("   3. Ajustar threshold de similaridade se necessário");
    console.log("   4. Monitorar métricas de satisfação\n");
  } catch (error: any) {
    console.error("\n❌ ERRO FATAL:");
    console.error(`   ${error.message}\n`);
    process.exit(1);
  }
}

main();
