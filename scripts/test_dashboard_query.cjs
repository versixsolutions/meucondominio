const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CONDOMINIO_ID = '5c624180-5fca-41fd-a5a0-a6e724f45d96';

async function testDashboardQuery() {
  console.log('🧪 Testando query do Dashboard...\n');
  
  // Mesma query que o Dashboard usa
  const { data, error } = await supabase
    .from('financial_transactions')
    .select(`
      *,
      category:financial_categories(name, type)
    `)
    .eq('condominio_id', CONDOMINIO_ID)
    .eq('status', 'approved')
    .order('reference_month', { ascending: true });

  if (error) {
    console.error('❌ Erro:', error);
    return;
  }

  console.log(`✅ Total de transações retornadas: ${data.length}\n`);

  // Agrupar por mês
  const monthlyData = {};
  
  data.forEach(t => {
    const date = new Date(t.reference_month);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[key]) {
      monthlyData[key] = {
        month: date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
        receitas: 0,
        despesas: 0,
        count: 0
      };
    }
    
    monthlyData[key].count++;
    
    if (t.amount > 0) {
      monthlyData[key].receitas += t.amount;
    } else {
      monthlyData[key].despesas += Math.abs(t.amount);
    }
  });

  // Mostrar resultados
  console.log('📊 Resumo por mês (como aparecerá no Dashboard):\n');
  
  Object.keys(monthlyData).sort().forEach(key => {
    const m = monthlyData[key];
    const saldo = m.receitas - m.despesas;
    
    console.log(`${m.month}:`);
    console.log(`  Receitas: R$ ${m.receitas.toFixed(2)}`);
    console.log(`  Despesas: R$ ${m.despesas.toFixed(2)}`);
    console.log(`  Saldo: R$ ${saldo.toFixed(2)}`);
    console.log(`  Transações: ${m.count}`);
    console.log('');
  });
}

testDashboardQuery().catch(console.error);
