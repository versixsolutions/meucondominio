-- ============================================================================
-- BACKUP DE FAQs ANTIGAS - Antes da migração para 300 FAQs v2.0
-- ============================================================================
-- Data: 2025-12-02
-- Executar ANTES de rodar os scripts de migração
-- ============================================================================

-- Criar tabela temporária com backup
CREATE TABLE IF NOT EXISTS public.faqs_backup_20251202 AS
SELECT * FROM public.faqs;

-- Verificar quantidade de registros backupeados
SELECT 
    COUNT(*) as total_faqs_backupeadas,
    COUNT(DISTINCT category) as total_categorias,
    MIN(created_at) as primeira_faq,
    MAX(created_at) as ultima_faq
FROM public.faqs_backup_20251202;

-- Mostrar distribuição por categoria
SELECT 
    category,
    COUNT(*) as quantidade
FROM public.faqs_backup_20251202
GROUP BY category
ORDER BY quantidade DESC;

-- Confirmar backup
SELECT 'Backup realizado com sucesso!' as status;
