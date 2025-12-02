-- ============================================
-- FIX: Políticas RLS da tabela FAQs
-- ============================================
-- Remove apenas as políticas problemáticas que leem headers HTTP

-- Remove políticas que causam erro de UUID
DROP POLICY IF EXISTS "faqs select by condominio" ON faqs;
DROP POLICY IF EXISTS "faqs select explicit filter" ON faqs;

-- Verifica políticas restantes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'faqs';
