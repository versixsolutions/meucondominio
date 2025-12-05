const fs = require('fs');

const content = fs.readFileSync('docs/dempp.csv', 'utf-8');

// Contar linhas que contém 2.1.73
const matches = content.match(/2\.1\.73/g);
console.log('2.1.73 aparece', matches?.length || 0, 'vezes no arquivo');

// Encontrar a linha completa
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('2.1.73')) {
    console.log(`\nLinha ${idx}:`);
    console.log(line);
    console.log('Próxima linha:', lines[idx + 1]);
  }
  if (line.includes('1.6-')) {
    console.log(`\n1.6 na linha ${idx}:`);
    console.log(line);
  }
});
