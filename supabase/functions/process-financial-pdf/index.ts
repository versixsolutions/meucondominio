import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

// ✅ ORIGENS PERMITIDAS
const ALLOWED_ORIGINS = [
  "https://versixnorma.com.br",
  "https://www.versixnorma.com.br",
  "https://app.versixnorma.com.br",
  "http://localhost:5173",
  "http://localhost:3000",
];

// ✅ FUNÇÃO PARA OBTER CORS HEADERS VÁLIDOS
function getCorsHeaders(origin?: string): Record<string, string> {
  const allowedOrigin =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "3600",
    "Content-Type": "application/json",
  };
}

serve(async (req) => {
  const origin = req.headers.get("origin") || undefined;
  const corsHeaders = getCorsHeaders(origin);

  // 1. Tratamento de CORS (Para o frontend conseguir chamar)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 2. Receber o Texto do PDF
    const { text } = await req.json();

    if (!text) {
      console.error("❌ Texto do PDF não fornecido");
      throw new Error("Texto do PDF não fornecido no corpo da requisição.");
    }

    console.log(`📄 PDF recebido: ${text.length} caracteres`);

    // 3. Inicializar Gemini
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY não configurada no ambiente");
      throw new Error(
        "GEMINI_API_KEY não configurada no servidor. Configure via Supabase Dashboard > Edge Functions > Secrets.",
      );
    }

    console.log("✅ GEMINI_API_KEY encontrada");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    console.log("🤖 Iniciando análise com Gemini...");

    // 4. Engenharia de Prompt (O "Cérebro" da operação)
    const prompt = `
      Atue como um analista contábil sênior. Sua tarefa é extrair dados financeiros de um texto desorganizado proveniente de um PDF de condomínio.

      ENTRADA:
      ${text.substring(0, 30000)}

      OBJETIVO:
      Identifique e estruture as RECEITAS (entradas, taxas, aluguéis) e DESPESAS (pagamentos, contas, manutenções).

      REGRAS CRÍTICAS:
      1. Ignore saldos anteriores, totais acumulados ou linhas de "transporte". Queremos apenas os lançamentos do mês/período.
      2. Data de Competência: Se o texto mencionar um mês (ex: "Jan/2025"), assuma o dia 10 desse mês para o campo 'date' (ex: "2025-01-10").
      3. Categorização:
         - Para Receitas: Use categorias como "Taxa Ordinária", "Taxa Extra", "Multas", "Aluguel Espaço", "Outros".
         - Para Despesas: Use categorias como "Pessoal", "Administrativa", "Manutenção", "Consumo" (água/luz), "Financeira".
      4. Formato de Saída: Retorne ESTRITAMENTE um JSON puro, sem crases, sem markdown, sem comentários.

      SCHEMA JSON ESPERADO:
      {
        "receitas": [
          { "description": "Nome da receita", "amount": 100.00, "date": "YYYY-MM-DD", "category": "Categoria" }
        ],
        "despesas": [
          { "description": "Nome da despesa", "amount": 50.50, "date": "YYYY-MM-DD", "category": "Categoria" }
        ]
      }
    `;

    // 5. Gerar Conteúdo
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let jsonString = response.text();

    console.log(
      `📊 Resposta da IA recebida: ${jsonString.substring(0, 200)}...`,
    );

    // Limpeza de segurança (caso a IA retorne markdown ```json)
    jsonString = jsonString
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Validar JSON
    const data = JSON.parse(jsonString);

    console.log(
      `✅ JSON válido: ${data.receitas?.length || 0} receitas, ${data.despesas?.length || 0} despesas`,
    );

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("❌ Erro no processamento IA:", error);
    console.error("Stack:", error.stack);

    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.stack?.split("\n")[0] || "Sem detalhes adicionais",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
