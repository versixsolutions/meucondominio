#!/usr/bin/env node
/**
 * Script de Migração para 300 FAQs v2.0
 * Executa os 6 arquivos SQL na ordem correta via Supabase REST API
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gjsnrrfuahfckvjlzwxw.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrado no .env');
  process.exit(1);
}

// Ordem dos arquivos SQL
const SQL_FILES = [
  'docs/versix_norma_faqs_v2.sql',
  'docs/versix_norma_faqs_v2_continuacao.sql',
  'docs/versix_norma_faqs_v2_parte3.sql',
  'docs/versix_norma_faqs_v2_FINAL.sql',
  'docs/versix_norma_faqs_complemento_final.sql',
  'docs/versix_norma_faqs_300_COMPLETO.sql'
];

async function executeSQL(sqlContent) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({ query: sqlContent })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  return await response.json();
}

async function executeSQLFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Arquivo não encontrado: ${fullPath}`);
  }

  const sqlContent = fs.readFileSync(fullPath, 'utf8');
  console.log(`📄 Lendo ${filePath}... (${sqlContent.length} caracteres)`);
  
  return sqlContent;
}

async function main() {
  console.log('============================================================================');
  console.log('MIGRAÇÃO PARA 300 FAQs v2.0 - Versix Norma');
  console.log('============================================================================\n');

  console.log('⚠️  ATENÇÃO: Esta operação vai:');
  console.log('  1. Dropar e recriar a tabela FAQs');
  console.log('  2. Inserir 300 novas FAQs otimizadas');
  console.log('  3. Criar índices e triggers\n');

  // Aguardar 3 segundos para dar tempo de cancelar
  console.log('Iniciando em 3 segundos... (Ctrl+C para cancelar)\n');
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('ETAPA 1: Fazendo backup da tabela atual...');
  try {
    const backupSQL = fs.readFileSync('scripts/backup-faqs-antiga.sql', 'utf8');
    console.log('ℹ️  Execute manualmente via Supabase Dashboard SQL Editor:');
    console.log('   scripts/backup-faqs-antiga.sql\n');
  } catch (err) {
    console.log('⚠️  Arquivo de backup não encontrado, continuando...\n');
  }

  console.log('ETAPA 2: Executando SQLs de migração...\n');

  let step = 1;
  for (const file of SQL_FILES) {
    try {
      console.log(`[${step}/${SQL_FILES.length}] Executando ${file}...`);
      
      const sqlContent = await executeSQLFile(file);
      
      console.log(`ℹ️  Arquivo ${file} deve ser executado manualmente no Supabase Dashboard`);
      console.log(`   SQL Editor: https://supabase.com/dashboard/project/gjsnrrfuahfckvjlzwxw/sql`);
      console.log('');
      
      step++;
    } catch (error) {
      console.error(`❌ Erro ao processar ${file}:`, error.message);
      process.exit(1);
    }
  }

  console.log('============================================================================');
  console.log('ℹ️  INSTRUÇÕES PARA CONCLUSÃO DA MIGRAÇÃO');
  console.log('============================================================================\n');
  console.log('Como a API REST do Supabase não permite executar DDL diretamente,');
  console.log('você precisa executar os SQLs manualmente:\n');
  console.log('1. Acesse: https://supabase.com/dashboard/project/gjsnrrfuahfckvjlzwxw/sql');
  console.log('2. Execute cada arquivo SQL na ORDEM EXATA:\n');
  
  SQL_FILES.forEach((file, idx) => {
    console.log(`   ${idx + 1}. ${file}`);
  });
  
  console.log('\n3. Após executar todos, verifique:');
  console.log('   SELECT COUNT(*) FROM public.faqs WHERE condominio_id = \'5c624180-5fca-41fd-a5a0-a6e724f45d96\';');
  console.log('   (Esperado: 300 FAQs)\n');
  
  console.log('Próximos passos após a migração:');
  console.log('  • Configurar HuggingFace token');
  console.log('  • Executar script de re-indexação Qdrant');
  console.log('  • Testar queries de exemplo\n');
}

main().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
