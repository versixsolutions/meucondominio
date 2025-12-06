-- ============================================
-- QUERIES ÚTEIS PARA CATEGORIAS FINANCEIRAS
-- ============================================

-- 1. LISTAR TODAS AS CATEGORIAS COM HIERARQUIA
-- ============================================
SELECT 
  code,
  name,
  type,
  parent_code,
  is_active,
  CASE 
    WHEN parent_code IS NULL THEN 'Nível 1 (Raiz)'
    WHEN code LIKE '%.%.%' THEN 'Nível 3 (Folha)'
    ELSE 'Nível 2 (Grupo)'
  END as nivel
FROM financial_categories
ORDER BY code;


-- 2. CONTAR CATEGORIAS POR TIPO
-- ============================================
SELECT 
  type,
  COUNT(*) as total,
  COUNT(CASE WHEN parent_code IS NULL THEN 1 END) as raizes,
  COUNT(CASE WHEN parent_code IS NOT NULL THEN 1 END) as subcategorias
FROM financial_categories
GROUP BY type;


-- 3. LISTAR RECEITAS OPERACIONAIS (1.1)
-- ============================================
SELECT code, name
FROM financial_categories
WHERE type = 'RECEITA'
  AND (code = '1.1' OR parent_code = '1.1' OR parent_code LIKE '1.1.%')
  AND is_active = true
ORDER BY code;


-- 4. RECEITAS POR CATEGORIA NO PERÍODO
-- ============================================
SELECT 
  fc.code,
  fc.name,
  COUNT(ft.id) as total_transacoes,
  SUM(ft.amount) as valor_total,
  AVG(ft.amount) as valor_medio
FROM financial_transactions ft
JOIN financial_categories fc ON ft.category_code = fc.code
WHERE ft.type = 'RECEITA'
  AND ft.month = '2025-12'
  AND fc.parent_code IS NOT NULL -- Apenas categorias específicas
GROUP BY fc.code, fc.name
ORDER BY valor_total DESC;


-- 5. DESPESAS POR GRUPO
-- ============================================
SELECT 
  fc_grupo.code,
  fc_grupo.name,
  COUNT(ft.id) as total_transacoes,
  SUM(ft.amount) as valor_total
FROM financial_transactions ft
JOIN financial_categories fc ON ft.category_code = fc.code
JOIN financial_categories fc_grupo ON fc.parent_code = fc_grupo.code
WHERE ft.type = 'DESPESA'
  AND ft.month = '2025-12'
  AND fc_grupo.parent_code = '2' -- Apenas grupos de despesa
GROUP BY fc_grupo.code, fc_grupo.name
ORDER BY valor_total DESC;


-- 6. RECEITA TOTAL DO PERÍODO (EXCLUINDO TRANSFERÊNCIAS)
-- ============================================
SELECT 
  SUM(ft.amount) as receita_total
FROM financial_transactions ft
JOIN financial_categories fc ON ft.category_code = fc.code
WHERE ft.type = 'RECEITA'
  AND ft.month = '2025-12'
  AND fc.parent_code != '1.3' -- Excluir transferências
  AND NOT ft.category_code LIKE '1.3.%';


-- 7. DESPESA TOTAL DO PERÍODO (EXCLUINDO TRANSFERÊNCIAS)
-- ============================================
SELECT 
  SUM(ft.amount) as despesa_total
FROM financial_transactions ft
JOIN financial_categories fc ON ft.category_code = fc.code
WHERE ft.type = 'DESPESA'
  AND ft.month = '2025-12'
  AND fc.parent_code != '2.8' -- Excluir transferências
  AND NOT ft.category_code LIKE '2.8.%';


-- 8. SALDO DO PERÍODO (RECEITA - DESPESA)
-- ============================================
WITH receita AS (
  SELECT SUM(ft.amount) as total
  FROM financial_transactions ft
  JOIN financial_categories fc ON ft.category_code = fc.code
  WHERE ft.type = 'RECEITA'
    AND ft.month = '2025-12'
    AND fc.parent_code != '1.3'
    AND NOT ft.category_code LIKE '1.3.%'
),
despesa AS (
  SELECT SUM(ft.amount) as total
  FROM financial_transactions ft
  JOIN financial_categories fc ON ft.category_code = fc.code
  WHERE ft.type = 'DESPESA'
    AND ft.month = '2025-12'
    AND fc.parent_code != '2.8'
    AND NOT ft.category_code LIKE '2.8.%'
)
SELECT 
  COALESCE(r.total, 0) as receita,
  COALESCE(d.total, 0) as despesa,
  COALESCE(r.total, 0) - COALESCE(d.total, 0) as saldo
FROM receita r, despesa d;


-- 9. CATEGORIAS SEM MOVIMENTO NO PERÍODO
-- ============================================
SELECT DISTINCT
  fc.code,
  fc.name,
  fc.type
FROM financial_categories fc
WHERE fc.is_active = true
  AND fc.parent_code IS NOT NULL -- Apenas categorias específicas
  AND NOT EXISTS (
    SELECT 1 FROM financial_transactions ft
    WHERE ft.category_code = fc.code
      AND ft.month = '2025-12'
  )
ORDER BY fc.type, fc.code;


-- 10. RELATÓRIO COMPARATIVO DE DOIS MESES
-- ============================================
SELECT 
  fc.code,
  fc.name,
  SUM(CASE WHEN ft.month = '2025-11' THEN ft.amount ELSE 0 END) as novembro,
  SUM(CASE WHEN ft.month = '2025-12' THEN ft.amount ELSE 0 END) as dezembro,
  SUM(CASE WHEN ft.month = '2025-12' THEN ft.amount ELSE 0 END) -
  SUM(CASE WHEN ft.month = '2025-11' THEN ft.amount ELSE 0 END) as diferenca
FROM financial_transactions ft
JOIN financial_categories fc ON ft.category_code = fc.code
WHERE ft.type = 'RECEITA'
  AND ft.month IN ('2025-11', '2025-12')
  AND fc.parent_code IS NOT NULL
GROUP BY fc.code, fc.name
ORDER BY diferenca DESC;


-- 11. TOP 10 CATEGORIAS POR MOVIMENTO
-- ============================================
SELECT 
  fc.code,
  fc.name,
  fc.type,
  COUNT(*) as transacoes,
  SUM(ft.amount) as total,
  MIN(ft.transaction_date) as primeira,
  MAX(ft.transaction_date) as ultima
FROM financial_transactions ft
JOIN financial_categories fc ON ft.category_code = fc.code
WHERE fc.parent_code IS NOT NULL
  AND ft.month = '2025-12'
GROUP BY fc.code, fc.name, fc.type
ORDER BY transacoes DESC
LIMIT 10;


-- 12. VERIFICAR INTEGRIDADE DE CATEGORIAS
-- ============================================
-- Categorias com parent_code que não existem
SELECT DISTINCT
  fc.code,
  fc.name,
  fc.parent_code
FROM financial_categories fc
WHERE fc.parent_code IS NOT NULL
  AND fc.parent_code NOT IN (
    SELECT code FROM financial_categories
  );


-- 13. EXPORTAR ESTRUTURA DE CATEGORIAS EM CSV
-- ============================================
COPY (
  SELECT 
    code,
    name,
    type,
    parent_code,
    is_active
  FROM financial_categories
  ORDER BY code
) TO STDOUT WITH CSV HEADER;


-- 14. CATEGORIAS INACESSÍVEIS (ÓRFÃS)
-- ============================================
SELECT 
  fc.code,
  fc.name,
  fc.parent_code
FROM financial_categories fc
WHERE fc.parent_code IS NOT NULL
  AND fc.parent_code NOT IN (
    SELECT code FROM financial_categories WHERE is_active = true
  );


-- 15. MESES COM MOVIMENTO
-- ============================================
SELECT DISTINCT
  ft.month,
  COUNT(*) as transacoes,
  SUM(ft.amount) as valor_total
FROM financial_transactions ft
GROUP BY ft.month
ORDER BY ft.month DESC;
