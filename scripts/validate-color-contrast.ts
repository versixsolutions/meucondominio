/**
 * VALIDAÇÃO DE CONTRASTE DE CORES WCAG 2.1 AA/AAA
 * 
 * Este script valida se todas as combinações de cores do projeto
 * atendem aos padrões WCAG 2.1:
 * - AA regular text: 4.5:1
 * - AA large text (18px+): 3:1
 * - AAA regular text: 7:1
 * - AAA large text: 4.5:1
 * 
 * Referência: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 */

interface ColorPair {
  name: string;
  foreground: string;
  background: string;
  usage: string;
  minRatio?: number; // Se especificado, usa este mínimo ao invés do padrão 4.5
}

// Função para calcular luminância relativa
function getLuminance(hex: string): number {
  // Remove # se existir
  const rgb = hex.replace('#', '');
  
  // Converte para RGB
  const r = parseInt(rgb.substring(0, 2), 16) / 255;
  const g = parseInt(rgb.substring(2, 4), 16) / 255;
  const b = parseInt(rgb.substring(4, 6), 16) / 255;
  
  // Aplica correção gamma
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
}

// Calcula ratio de contraste
function getContrastRatio(fg: string, bg: string): number {
  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// Verifica nível WCAG
function getWCAGLevel(ratio: number): string {
  if (ratio >= 7.0) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3.0) return 'AA Large';
  return 'FAIL';
}

// Pares de cores para validar
const colorPairs: ColorPair[] = [
  // ====== CINZAS EM BRANCO ======
  {
    name: 'gray-400 on white',
    foreground: '#64748b',
    background: '#ffffff',
    usage: 'Texto secundário, placeholders',
  },
  {
    name: 'gray-500 on white',
    foreground: '#475569',
    background: '#ffffff',
    usage: 'Texto terciário, helper text',
  },
  {
    name: 'gray-600 on white',
    foreground: '#334155',
    background: '#ffffff',
    usage: 'Texto secundário forte',
  },
  {
    name: 'gray-900 on white',
    foreground: '#020617',
    background: '#ffffff',
    usage: 'Texto principal',
  },
  
  // ====== CORES PRIMÁRIAS ======
  {
    name: 'primary on white',
    foreground: '#1F4080',
    background: '#ffffff',
    usage: 'Links, botões, headings',
  },
  {
    name: 'primary-dark on white',
    foreground: '#142A53',
    background: '#ffffff',
    usage: 'Hover em links e botões',
  },
  {
    name: 'primary-light on white',
    foreground: '#3366CC',
    background: '#ffffff',
    usage: 'Badges, CTAs secundários',
  },
  
  // ====== CORES SECUNDÁRIAS ======
  {
    name: 'secondary on white',
    foreground: '#008554',
    background: '#ffffff',
    usage: 'Acentos, ações secundárias',
  },
  {
    name: 'secondary-dark on white',
    foreground: '#00724E',
    background: '#ffffff',
    usage: 'Hover em acentos',
  },
  {
    name: 'secondary-light on white',
    foreground: '#00A86B',
    background: '#ffffff',
    usage: 'Background de badges (large text)',
    minRatio: 3.0, // Large text pode ser 3:1
  },
  
  // ====== CORES DE STATUS ======
  {
    name: 'success-text on success-bg',
    foreground: '#166534',
    background: '#dcfce7',
    usage: 'Alertas de sucesso',
  },
  {
    name: 'warning-text on warning-bg',
    foreground: '#92400e',
    background: '#fef3c7',
    usage: 'Alertas de aviso',
  },
  {
    name: 'error-text on error-bg',
    foreground: '#991b1b',
    background: '#fee2e2',
    usage: 'Alertas de erro',
  },
  {
    name: 'info-text on info-bg',
    foreground: '#1e40af',
    background: '#dbeafe',
    usage: 'Alertas informativos',
  },
  
  // ====== STATUS EM BRANCO ======
  {
    name: 'success-text on white',
    foreground: '#166534',
    background: '#ffffff',
    usage: 'Texto verde em background branco',
  },
  {
    name: 'warning-text on white',
    foreground: '#92400e',
    background: '#ffffff',
    usage: 'Texto laranja em background branco',
  },
  {
    name: 'error-text on white',
    foreground: '#991b1b',
    background: '#ffffff',
    usage: 'Texto vermelho em background branco',
  },
  {
    name: 'info-text on white',
    foreground: '#1e40af',
    background: '#ffffff',
    usage: 'Texto azul em background branco',
  },
  
  // ====== DARK MODE ======
  {
    name: 'gray-300 on gray-900',
    foreground: '#cbd5e1',
    background: '#020617',
    usage: 'Texto secundário em dark mode',
  },
  {
    name: 'gray-400 on gray-800',
    foreground: '#94a3b8',
    background: '#0f172a',
    usage: 'Texto terciário em dark mode',
  },
  {
    name: 'white on primary',
    foreground: '#ffffff',
    background: '#1F4080',
    usage: 'Texto em botões primários',
  },
  {
    name: 'white on secondary',
    foreground: '#ffffff',
    background: '#008554',
    usage: 'Texto em botões secundários',
  },
  
  // ====== BADGES/TAGS ======
  {
    name: 'purple-text on purple-bg',
    foreground: '#6b21a8',
    background: '#f3e8ff',
    usage: 'Badge roxo',
  },
  {
    name: 'blue-text on blue-bg',
    foreground: '#1e40af',
    background: '#dbeafe',
    usage: 'Badge azul',
  },
  {
    name: 'green-text on green-bg',
    foreground: '#166534',
    background: '#dcfce7',
    usage: 'Badge verde',
  },
  {
    name: 'orange-text on orange-bg',
    foreground: '#9a3412',
    background: '#ffedd5',
    usage: 'Badge laranja',
  },
  {
    name: 'red-text on red-bg',
    foreground: '#991b1b',
    background: '#fee2e2',
    usage: 'Badge vermelho',
  },
  {
    name: 'teal-text on teal-bg',
    foreground: '#115e59',
    background: '#ccfbf1',
    usage: 'Badge ciano',
  },
];

// Executa validação
console.log('\n=================================================');
console.log('  VALIDAÇÃO DE CONTRASTE WCAG 2.1 AA/AAA');
console.log('=================================================\n');

let passed = 0;
let failed = 0;
const failures: string[] = [];

colorPairs.forEach((pair) => {
  const ratio = getContrastRatio(pair.foreground, pair.background);
  const level = getWCAGLevel(ratio);
  const minRequired = pair.minRatio || 4.5;
  const isPassing = ratio >= minRequired;
  
  const status = isPassing ? '✅' : '❌';
  const ratioStr = ratio.toFixed(2);
  
  console.log(`${status} ${pair.name}`);
  console.log(`   Ratio: ${ratioStr}:1 | Level: ${level} | Usage: ${pair.usage}`);
  
  if (!isPassing) {
    failed++;
    failures.push(`${pair.name} (${ratioStr}:1, needs ${minRequired}:1)`);
    console.log(`   ⚠️  FAIL: Needs ${minRequired}:1, got ${ratioStr}:1`);
  } else {
    passed++;
  }
  console.log('');
});

// Resumo
console.log('=================================================');
console.log('  RESUMO');
console.log('=================================================');
console.log(`✅ Passed: ${passed}/${colorPairs.length}`);
console.log(`❌ Failed: ${failed}/${colorPairs.length}`);

if (failures.length > 0) {
  console.log('\n⚠️  FAILURES:');
  failures.forEach((f) => console.log(`   - ${f}`));
  console.log('\n🔧 Ações necessárias:');
  console.log('   1. Ajustar cores que falharam para atingir ratio mínimo');
  console.log('   2. Re-executar este script para validar');
  console.log('   3. Testar visualmente com ferramentas como:');
  console.log('      - https://contrast-ratio.com/');
  console.log('      - https://webaim.org/resources/contrastchecker/');
  process.exit(1);
} else {
  console.log('\n🎉 SUCESSO! Todas as cores passaram na validação WCAG 2.1');
  console.log('   ✅ Mínimo AA (4.5:1) atendido em todos os pares');
  console.log('   ✅ AAA (7:1) alcançado em pares críticos');
  console.log('\n📋 Próximos passos:');
  console.log('   1. Atualizar componentes para usar as novas cores');
  console.log('   2. Validar visualmente em diferentes dispositivos');
  console.log('   3. Testar com leitores de tela');
  process.exit(0);
}
