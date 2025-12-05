const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CONDOMINIO_ID = '5c624180-5fca-41fd-a5a0-a6e724f45d96';

async function checkDates() {
  const { data } = await supabase
    .from('financial_transactions')
    .select('reference_month, description')
    .eq('condominio_id', CONDOMINIO_ID)
    .limit(10)
    .order('reference_month', { ascending: true });

  console.log('📅 Primeiras 10 transações:\n');
  data.forEach(t => {
    const date = new Date(t.reference_month);
    console.log(`${t.reference_month} -> JS Date: ${date.toISOString()} -> Mês: ${date.getMonth() + 1}`);
    console.log(`  Descrição: ${t.description.substring(0, 50)}...`);
    console.log('');
  });
}

checkDates().catch(console.error);
