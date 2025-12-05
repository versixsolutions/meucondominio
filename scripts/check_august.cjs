const fs = require('fs');

// Ler o arquivo CSV original
const content = fs.readFileSync('docs/dempp.csv', 'utf-8');

// Normalizar quebras de linha dentro de campos entre aspas
const normalizedContent = content.replace(/"([^"]*(?:\r?\n[^"]*)*)"/g, (match, p1) => {
  return `"${p1.replace(/\r?\n/g, ' ').trim()}"`;
});

const lines = normalizedContent.split('\n').filter(line => line.trim());

// Função para limpar valores monetários brasileiros
function parseValue(value) {
  if (!value || value.trim() === '') return 0;
  return parseFloat(value.replace(/\./g, '').replace(',', '.'));
}

// Processar cada linha e somar August (coluna 8, index 8)
let totalAugustExpenses = 0;
let totalAugustRevenues = 0;

lines.slice(1).forEach((line, idx) => {
  if (!line.trim()) return;
  
  const parts = line.split(';');
  const account = parts[0]?.trim().replace(/^"|"$/g, '');
  
  if (!account || !account.match(/^[12]\.[^-]+-/)) return;
  
  const accountMatch = account.match(/^([12]\.[^-]+)-(.+)$/);
  if (!accountMatch) return;
  
  const categoryCode = accountMatch[1].trim();
  
  // Ignorar transferências e totalizadores
  if (categoryCode.startsWith('1.3') || categoryCode.startsWith('2.8')) return;
  
  const levels = categoryCode.split('.');
  if (levels.length === 1) return;
  if (levels.length === 2 && levels[1].length === 1 && categoryCode !== '1.6') return;
  
  // Agosto é a coluna 8 (index 8)
  const augustValue = parseValue(parts[8]);
  if (augustValue === 0) return;
  
  if (categoryCode.startsWith('1.')) {
    totalAugustRevenues += augustValue;
    console.log(`Receita ${categoryCode}: R$ ${augustValue.toFixed(2)}`);
  } else if (categoryCode.startsWith('2.')) {
    totalAugustExpenses += augustValue;
    console.log(`Despesa ${categoryCode}: R$ ${augustValue.toFixed(2)}`);
  }
});

console.log('\n=== TOTAIS DE AGOSTO ===');
console.log(`Receitas: R$ ${totalAugustRevenues.toFixed(2)}`);
console.log(`Despesas: R$ ${totalAugustExpenses.toFixed(2)}`);
