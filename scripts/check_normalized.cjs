const fs = require('fs');

// Ler o arquivo CSV original
const content = fs.readFileSync('docs/dempp.csv', 'utf-8');

// Normalizar quebras de linha dentro de campos entre aspas
const normalizedContent = content.replace(/"([^"]*(?:\r?\n[^"]*)*)"/g, (match, p1) => {
  return `"${p1.replace(/\r?\n/g, ' ').trim()}"`;
});

// Procurar por 2.1.73
const lines = normalizedContent.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('2.1.73')) {
    console.log(`Linha ${i}:`);
    console.log(lines[i]);
    console.log('');
    
    // Testar split
    const parts = lines[i].split(';');
    console.log('Primeira parte:', parts[0]);
  }
}
