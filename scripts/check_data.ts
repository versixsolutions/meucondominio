import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const CONDOMINIO_ID = "5c624180-5fca-41fd-a5a0-a6e724f45d96";

async function checkData() {
  const { count, error } = await supabase
    .from("financial_transactions")
    .select("*", { count: "exact", head: true })
    .eq("condominio_id", CONDOMINIO_ID);

  if (error) console.error(error);
  console.log(`Total de transações no banco: ${count}`);

  // Verificar soma de receitas de Janeiro/2025
  const { data } = await supabase
    .from("financial_transactions")
    .select("amount")
    .eq("condominio_id", CONDOMINIO_ID)
    .gte("reference_month", "2025-01-01")
    .lt("reference_month", "2025-02-01")
    .gt("amount", 0); // Receitas

  const totalJan = data?.reduce((sum, t) => sum + t.amount, 0);
  console.log(`Total Receitas Janeiro 2025: ${totalJan}`);
}

checkData();
