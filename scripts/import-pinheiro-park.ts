import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ID do Pinheiro Park encontrado nos scripts do projeto
const CONDOMINIO_ID = "5c624180-5fca-41fd-a5a0-a6e724f45d96";

// Tenta carregar dados de um arquivo JSON ou CSV local se existir
// Caso contrário usa os dados hardcoded abaixo
let transactions = [
  // Janeiro
  {
    condominio_id: CONDOMINIO_ID,
    category_code: "1.1.01",
    description: "Taxa de Condomínio - Janeiro/2025",
    amount: 29250.2,
    reference_month: "2025-01-01",
    payment_date: "2025-01-10",
    status: "approved",
    created_by: null, // Importação histórica
  },
  {
    condominio_id: CONDOMINIO_ID,
    category_code: "2.1.59",
    description: "Portaria Eletrônica / Virtual - Janeiro/2025",
    amount: -5721.0,
    reference_month: "2025-01-01",
    payment_date: "2025-01-15",
    status: "approved",
  },
  {
    condominio_id: CONDOMINIO_ID,
    category_code: "2.3.01",
    description: "Energia Elétrica - Março/2025",
    amount: -2841.07,
    reference_month: "2025-03-01",
    payment_date: "2025-03-10",
    status: "approved",
  },
  // ... adicionar todas as outras transações do demonstrativo
];

async function importData() {
  console.log("🚀 Iniciando importação de dados...");
  console.log(`🏢 Condomínio ID: ${CONDOMINIO_ID}`);

  // Verificar se existe arquivo CSV para importar
  const csvPath = "scripts/pinheiro_park_real.csv";
  if (fs.existsSync(csvPath)) {
    console.log("📂 Arquivo CSV encontrado! Processando...");
    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const lines = csvContent.split("\n");
    // Detect delimiter (comma or semicolon)
    const firstLine = lines[0];
    const delimiter = firstLine.includes(";") ? ";" : ",";
    console.log(`Using delimiter: ${delimiter}`);

    const headers = lines[0]
      .split(delimiter)
      .map((h) => h.trim().replace(/^"|"$/g, "")); // Remove quotes if any

    const csvTransactions = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Simple split doesn't handle quoted values with delimiters inside, but we switched to semicolon
      // which shouldn't be in the text.
      const values = line.split(delimiter);
      const row: any = {};

      headers.forEach((header, index) => {
        let val = values[index]?.trim();
        if (val) val = val.replace(/^"|"$/g, ""); // Remove quotes
        row[header] = val;
      });

      // Mapear colunas do CSV para o formato esperado
      // Espera-se: category_code, description, amount, reference_month, payment_date
      if (row.category_code && row.amount) {
        let amount = parseFloat(row.amount);

        // Ajustar sinal conforme o tipo de categoria (Regra de Negócio do Banco)
        // Receitas (1.x) devem ser positivas
        // Despesas (2.x) devem ser negativas
        if (row.category_code.startsWith("2")) {
          amount = -Math.abs(amount);
        } else if (row.category_code.startsWith("1")) {
          amount = Math.abs(amount);
        }

        csvTransactions.push({
          condominio_id: CONDOMINIO_ID,
          category_code: row.category_code,
          description: row.description || `Transação ${row.category_code}`,
          amount: amount,
          reference_month:
            row.reference_month || new Date().toISOString().split("T")[0],
          payment_date:
            row.payment_date || new Date().toISOString().split("T")[0],
          status: "approved",
          created_by: null,
        });
      }
    }

    if (csvTransactions.length > 0) {
      console.log(`📊 ${csvTransactions.length} transações lidas do CSV.`);
      transactions = csvTransactions;

      // 1. Garantir que todas as categorias existam
      console.log("🔄 Verificando categorias...");
      const uniqueCategories = new Map();

      transactions.forEach((t) => {
        if (!uniqueCategories.has(t.category_code)) {
          // Extrair nome da descrição (remover " - Mês/Ano")
          const name = t.description.split(" - ")[0];
          const type = t.category_code.startsWith("1") ? "RECEITA" : "DESPESA";
          // Parent code: 1.1.01 -> 1.1
          const parts = t.category_code.split(".");
          const parent_code =
            parts.length > 1
              ? parts.slice(0, parts.length - 1).join(".")
              : null;

          uniqueCategories.set(t.category_code, {
            code: t.category_code,
            name: name,
            type: type,
            parent_code: parent_code,
          });
        }
      });

      const categoriesToInsert = Array.from(uniqueCategories.values());

      // Inserir categorias em lotes
      for (let i = 0; i < categoriesToInsert.length; i += 50) {
        const batch = categoriesToInsert.slice(i, i + 50);
        const { error } = await supabase
          .from("financial_categories")
          .upsert(batch, { onConflict: "code", ignoreDuplicates: true });

        if (error) {
          console.error("❌ Erro ao inserir categorias:", error);
        }
      }
      console.log("✅ Categorias sincronizadas.");
    }
  }

  if (CONDOMINIO_ID === "PINHEIRO_PARK_ID") {
    console.warn(
      "⚠️  ATENÇÃO: Você precisa substituir o CONDOMINIO_ID no script pelo ID real do condomínio.",
    );
    // Tentar buscar o ID se possível ou continuar apenas para teste
  }

  // 0. Limpar dados existentes para evitar duplicidade
  console.log("🧹 Limpando transações existentes...");
  const { error: deleteError } = await supabase
    .from("financial_transactions")
    .delete()
    .eq("condominio_id", CONDOMINIO_ID);

  if (deleteError) {
    console.error("❌ Erro ao limpar dados:", deleteError);
    return;
  }
  console.log("✅ Dados antigos removidos.");

  // Inserir em lotes de 100
  for (let i = 0; i < transactions.length; i += 100) {
    const batch = transactions.slice(i, i + 100);

    const { error } = await supabase
      .from("financial_transactions")
      .insert(batch);

    if (error) {
      console.error("❌ Erro no lote", i, error);
    } else {
      console.log(
        `✅ Importado lote ${i / 100 + 1} (${batch.length} transações)`,
      );
    }
  }

  console.log("✅ Importação concluída!");
}

importData();
