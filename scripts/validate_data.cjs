const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CONDOMINIO_ID = '5c624180-5fca-41fd-a5a0-a6e724f45d96';

async function validateData() {
  console.log('\n📊 VALIDAÇÃO DE DADOS - PINHEIRO PARK\n');
  
  const months = [
    { name: 'Janeiro/25', start: '2025-01-01', end: '2025-02-01' },
    { name: 'Fevereiro/25', start: '2025-02-01', end: '2025-03-01' },
    { name: 'Março/25', start: '2025-03-01', end: '2025-04-01' },
    { name: 'Abril/25', start: '2025-04-01', end: '2025-05-01' },
    { name: 'Maio/25', start: '2025-05-01', end: '2025-06-01' },
    { name: 'Junho/25', start: '2025-06-01', end: '2025-07-01' },
    { name: 'Julho/25', start: '2025-07-01', end: '2025-08-01' },
    { name: 'Agosto/25', start: '2025-08-01', end: '2025-09-01' },
    { name: 'Setembro/25', start: '2025-09-01', end: '2025-10-01' }
  ];
  
  // Valores esperados do demonstrativo original
  const expectedValues = {
    'Janeiro/25': { receitas: 61549.64, despesas: 15859.76 },
    'Fevereiro/25': { receitas: 83956.27, despesas: 53189.66 },
    'Março/25': { receitas: 30120.32, despesas: 117077.19 },
    'Abril/25': { receitas: 43247.90, despesas: 39535.70 },
    'Maio/25': { receitas: 137272.47, despesas: 131866.21 },
    'Junho/25': { receitas: 53762.00, despesas: 30911.94 },
    'Julho/25': { receitas: 46780.36, despesas: 81393.82 },
    'Agosto/25': { receitas: 43412.55, despesas: 14464.62 }, // Corrigido: inclui 2.2.29 (R$ 103.03)
    'Setembro/25': { receitas: 43588.93, despesas: 49977.43 }
  };
  
  for (const month of months) {
    const { data } = await supabase
      .from('financial_transactions')
      .select('amount')
      .eq('condominio_id', CONDOMINIO_ID)
      .gte('reference_month', month.start)
      .lt('reference_month', month.end);
    
    const receitas = data?.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0) || 0;
    const despesas = Math.abs(data?.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0) || 0);
    const saldo = receitas - despesas;
    
    const expected = expectedValues[month.name];
    const receitaOk = Math.abs(receitas - expected.receitas) < 0.5;
    const despesaOk = Math.abs(despesas - expected.despesas) < 0.5;
    
    console.log(`${month.name}:`);
    console.log(`  Receitas: R$ ${receitas.toFixed(2)} ${receitaOk ? '✅' : '❌ (Esperado: ' + expected.receitas + ')'}`);
    console.log(`  Despesas: R$ ${despesas.toFixed(2)} ${despesaOk ? '✅' : '❌ (Esperado: ' + expected.despesas + ')'}`);
    console.log(`  Saldo: R$ ${saldo.toFixed(2)}`);
    console.log('');
  }
}

validateData();
