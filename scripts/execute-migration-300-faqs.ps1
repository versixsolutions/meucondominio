# ============================================================================
# SCRIPT DE MIGRAÇÃO PARA 300 FAQs v2.0
# ============================================================================
# Data: 2025-12-02
# Executa os 6 arquivos SQL na ordem correta
# ============================================================================

$ErrorActionPreference = "Stop"

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "MIGRAÇÃO PARA 300 FAQs v2.0 - Versix Norma" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Configurações do Supabase
$PROJECT_REF = "gjsnrrfuahfckvjlzwxw"
$SUPABASE_URL = "https://gjsnrrfuahfckvjlzwxw.supabase.co"

# Pedir confirmação
Write-Host "⚠️  ATENÇÃO: Esta operação vai:" -ForegroundColor Yellow
Write-Host "  1. Fazer backup da tabela FAQs atual" -ForegroundColor Yellow
Write-Host "  2. Dropar e recriar a tabela FAQs" -ForegroundColor Yellow
Write-Host "  3. Inserir 300 novas FAQs otimizadas" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Deseja continuar? (sim/não)"

if ($confirm -ne "sim") {
    Write-Host "❌ Operação cancelada pelo usuário" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "ETAPA 1: Fazendo backup da tabela FAQs atual..." -ForegroundColor Green

# Executar backup
try {
    npx supabase db execute --linked --file "scripts/backup-faqs-antiga.sql"
    Write-Host "✅ Backup realizado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao fazer backup: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "ETAPA 2: Executando SQLs de migração na ordem correta..." -ForegroundColor Green

# Ordem de execução dos arquivos SQL
$sqlFiles = @(
    "docs/versix_norma_faqs_v2.sql",
    "docs/versix_norma_faqs_v2_continuacao.sql",
    "docs/versix_norma_faqs_v2_parte3.sql",
    "docs/versix_norma_faqs_v2_FINAL.sql",
    "docs/versix_norma_faqs_complemento_final.sql",
    "docs/versix_norma_faqs_300_COMPLETO.sql"
)

$step = 1
foreach ($file in $sqlFiles) {
    Write-Host ""
    Write-Host "[$step/6] Executando $file..." -ForegroundColor Cyan
    
    try {
        npx supabase db execute --linked --file $file
        Write-Host "✅ $file executado com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao executar $file : $_" -ForegroundColor Red
        Write-Host "Abortando migração..." -ForegroundColor Red
        exit 1
    }
    
    $step++
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "ETAPA 3: Verificando dados inseridos..." -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Cyan

# Criar script de verificação
$verifyScript = @"
-- Contar total de FAQs
SELECT COUNT(*) as total_faqs FROM public.faqs 
WHERE condominio_id = '5c624180-5fca-41fd-a5a0-a6e724f45d96';

-- Distribuição por categoria
SELECT category, COUNT(*) as count
FROM public.faqs
WHERE condominio_id = '5c624180-5fca-41fd-a5a0-a6e724f45d96'
GROUP BY category
ORDER BY count DESC;

-- Verificar metadados
SELECT 
    COUNT(*) FILTER (WHERE tags IS NOT NULL AND array_length(tags, 1) > 0) as with_tags,
    COUNT(*) FILTER (WHERE keywords IS NOT NULL AND array_length(keywords, 1) > 0) as with_keywords,
    COUNT(*) FILTER (WHERE article_reference IS NOT NULL) as with_references,
    COUNT(*) FILTER (WHERE question_variations IS NOT NULL AND array_length(question_variations, 1) > 0) as with_variations
FROM public.faqs
WHERE condominio_id = '5c624180-5fca-41fd-a5a0-a6e724f45d96';
"@

$verifyScript | Out-File -FilePath "scripts/verify-migration.sql" -Encoding utf8

try {
    npx supabase db execute --linked --file "scripts/verify-migration.sql"
    Write-Host "✅ Verificação concluída!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Não foi possível executar verificação automática" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "  1. Verificar HuggingFace token configurado" -ForegroundColor White
Write-Host "  2. Executar script de re-indexação no Qdrant" -ForegroundColor White
Write-Host "  3. Testar queries de exemplo" -ForegroundColor White
Write-Host "  4. Atualizar frontend (se necessário)" -ForegroundColor White
Write-Host ""
