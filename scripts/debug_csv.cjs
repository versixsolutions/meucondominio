const fs = require('fs');
const path = require('path');

const csvContent = fs.readFileSync('scripts/pinheiro_park_real.csv', 'utf-8');
const lines = csvContent.split('\n');

console.log(`Total de linhas no CSV: ${lines.length}`);
console.log('\nPrimeiras 20 linhas:');
lines.slice(0, 20).forEach((line, idx) => {
  console.log(`${idx}: ${line}`);
});

// Verificar se existe 1.6
const line16 = lines.find(l => l.includes('1.6'));
console.log('\n1.6 encontrado?', line16 || 'NÃO');

// Verificar 2.1.73
const line2173 = lines.filter(l => l.includes('2.1.73'));
console.log('\n2.1.73 encontrado:', line2173.length, 'vezes');
line2173.forEach(l => console.log(l));
