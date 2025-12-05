const fs = require('fs');

// Ler o arquivo CSV original
const content = fs.readFileSync('docs/dempp.csv', 'utf-8');

// Normalizar quebras de linha dentro de campos entre aspas
// A regex agora captura corretamente campos com múltiplas linhas
const normalizedContent = content.replace(/"([^"]*(?:\r?\n[^"]*)*)"/g, (match, p1) => {
  return `"${p1.replace(/\r?\n/g, ' ').trim()}"`;
});

const lines = normalizedContent.split('\n').filter(line => line.trim());

// Mapeamento de meses
const months = {
  'Jan/25': { ref: '2025-01-01', pay: '2025-01-10' },
  'Fev/25': { ref: '2025-02-01', pay: '2025-02-10' },
  'Mar/25': { ref: '2025-03-01', pay: '2025-03-10' },
  'Abr/25': { ref: '2025-04-01', pay: '2025-04-10' },
  'Mai/25': { ref: '2025-05-01', pay: '2025-05-10' },
  'Jun/25': { ref: '2025-06-01', pay: '2025-06-10' },
  'Jul/25': { ref: '2025-07-01', pay: '2025-07-10' },
  'Ago/25': { ref: '2025-08-01', pay: '2025-08-10' },
  'Set/25': { ref: '2025-09-01', pay: '2025-09-10' }
};

// Função para limpar valores monetários brasileiros
function parseValue(value) {
  if (!value || value.trim() === '') return 0;
  // Remove pontos de milhar e substitui vírgula por ponto
  return parseFloat(value.replace(/\./g, '').replace(',', '.'));
}

// Extrair cabeçalho
const header = lines[0].split(';');
const monthColumns = header.slice(1, 10); // Jan/25 até Set/25

console.log('Meses encontrados:', monthColumns);

const transactions = [];

// Processar cada linha (ignorar as primeiras linhas vazias/cabeçalho)
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim() || line.includes('Saldo Anterior') || line.includes('Resultado') || line.includes('Saldo')) continue;
  
  const parts = line.split(';');
  const account = parts[0]?.trim().replace(/^"|"$/g, ''); // Remove aspas iniciais e finais
  
  // Verificar se é uma conta válida (formato: X.X-Nome ou X.X.X-Nome)
  if (!account || !account.match(/^[12]\.[^-]+-/)) continue;
  
  // Extrair código e nome da conta
  const accountMatch = account.match(/^([12]\.[^-]+)-(.+)$/);
  if (!accountMatch) continue;
  
  const categoryCode = accountMatch[1].trim();
  const categoryName = accountMatch[2].trim();
  
  // Ignorar transferências internas
  if (categoryCode.startsWith('1.3') || categoryCode.startsWith('2.8')) continue;
  
  // Ignorar totalizadores de 1º nível (ex: "1", "2")
  const levels = categoryCode.split('.');
  if (levels.length === 1) continue;
  
  // Ignorar totalizadores de 2º nível (ex: "1.1", "1.2", "2.1", "2.6")
  // EXCETO "1.6" que é uma conta folha real
  if (levels.length === 2 && levels[1].length === 1 && categoryCode !== '1.6') continue;
  
  // Processar cada mês
  monthColumns.forEach((month, idx) => {
    const value = parseValue(parts[idx + 1]);
    if (value === 0) return; // Ignorar valores zerados
    
    const monthData = months[month];
    if (!monthData) return;
    
    // Ajustar sinal: Receitas (1.x) positivas, Despesas (2.x) negativas
    const amount = categoryCode.startsWith('2') ? -Math.abs(value) : Math.abs(value);
    
    transactions.push({
      category_code: categoryCode,
      description: `${categoryName} - ${month}`,
      amount: amount,
      reference_month: monthData.ref,
      payment_date: monthData.pay
    });
  });
}

console.log(`Total de transações processadas: ${transactions.length}`);

// Estatísticas
const receitas = transactions.filter(t => t.amount > 0);
const despesas = transactions.filter(t => t.amount < 0);
console.log(`Receitas: ${receitas.length} | Despesas: ${despesas.length}`);
console.log(`Total Receitas: R$ ${receitas.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}`);
console.log(`Total Despesas: R$ ${Math.abs(despesas.reduce((sum, t) => sum + t.amount, 0)).toFixed(2)}`);

// Gerar CSV de saída
const output = ['category_code;description;amount;reference_month;payment_date'];
transactions.forEach(t => {
  output.push(`${t.category_code};"${t.description}";${t.amount};${t.reference_month};${t.payment_date}`);
});

fs.writeFileSync('scripts/pinheiro_park_real.csv', output.join('\n'), 'utf-8');
console.log('✅ Arquivo scripts/pinheiro_park_real.csv criado com sucesso!');
