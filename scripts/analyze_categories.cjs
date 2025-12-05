const fs = require('fs');

// Ler CSV gerado
const csv = fs.readFileSync('scripts/pinheiro_park_real.csv', 'utf-8');
const lines = csv.split('\n').filter(l => l.trim());

console.log(`Total de linhas no CSV: ${lines.length}`);

// Agrupar por código de categoria e contar
const byCategory = {};
lines.slice(1).forEach(line => {
  const parts = line.split(';');
  const code = parts[0];
  if (!byCategory[code]) {
    byCategory[code] = { count: 0, total: 0 };
  }
  byCategory[code].count++;
  
  // Extrair valor (coluna 2)
  const value = parseFloat(parts[2]);
  byCategory[code].total += value;
});

// Ordenar por código
const sorted = Object.keys(byCategory).sort();

console.log('\nContas de DESPESAS (2.x):');
sorted.filter(c => c.startsWith('2.')).forEach(code => {
  const data = byCategory[code];
  console.log(`${code}: ${data.count} transações, Total: R$ ${data.total.toFixed(2)}`);
});

console.log('\nContas de RECEITAS (1.x):');
sorted.filter(c => c.startsWith('1.')).forEach(code => {
  const data = byCategory[code];
  console.log(`${code}: ${data.count} transações, Total: R$ ${data.total.toFixed(2)}`);
});
