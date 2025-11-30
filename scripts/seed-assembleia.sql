-- ============================================
-- SEED: Assembleia de Teste
-- Execute este SQL diretamente no Supabase SQL Editor
-- ============================================

-- 1. Obter um condominio_id válido (ajuste se necessário)
DO $$
DECLARE
  v_condominio_id UUID;
  v_assembleia_id UUID;
BEGIN
  -- Pegar primeiro condomínio disponível
  SELECT id INTO v_condominio_id FROM condominios LIMIT 1;
  
  IF v_condominio_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum condomínio encontrado. Crie um condomínio primeiro.';
  END IF;
  
  RAISE NOTICE 'Usando condomínio: %', v_condominio_id;
  
  -- 2. Criar assembleia em andamento
  INSERT INTO assembleias (
    condominio_id,
    titulo,
    data_hora,
    status,
    edital_topicos,
    link_presenca
  ) VALUES (
    v_condominio_id,
    'Assembleia de Teste - Presença & Votação',
    NOW(),
    'em_andamento',
    ARRAY['Abertura', 'Ordem do dia', 'Encaminhamentos'],
    NULL
  ) RETURNING id INTO v_assembleia_id;
  
  RAISE NOTICE 'Assembleia criada: %', v_assembleia_id;
  
  -- 3. Criar pautas de votação
  INSERT INTO assembleias_pautas (
    assembleia_id,
    titulo,
    descricao,
    ordem,
    status,
    tipo_votacao,
    opcoes
  ) VALUES 
  (
    v_assembleia_id,
    'Aprovação do orçamento 2026',
    'Deliberação sobre o orçamento anual proposto pela administração.',
    1,
    'em_votacao',
    'aberta',
    ARRAY['Sim', 'Não', 'Abstenção']
  ),
  (
    v_assembleia_id,
    'Troca de empresa de portaria',
    'Proposta de troca de fornecedor atual por melhor custo/benefício.',
    2,
    'pendente',
    'secreta',
    ARRAY['Trocar', 'Manter']
  );
  
  RAISE NOTICE 'Pautas criadas com sucesso!';
  
  -- 4. Mostrar resultado
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SEED CONCLUÍDO COM SUCESSO!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Assembleia ID: %', v_assembleia_id;
  RAISE NOTICE '';
  RAISE NOTICE '🔗 URLs para testar:';
  RAISE NOTICE '   Admin: /admin/assembleias';
  RAISE NOTICE '   Detalhes: /transparencia/assembleias/%', v_assembleia_id;
  RAISE NOTICE '   Presença: /transparencia/assembleias/%/presenca', v_assembleia_id;
  RAISE NOTICE '';
  
END $$;

-- Verificar resultado
SELECT 
  a.id,
  a.titulo,
  a.status,
  a.data_hora,
  COUNT(p.id) as total_pautas
FROM assembleias a
LEFT JOIN assembleias_pautas p ON p.assembleia_id = a.id
WHERE a.titulo LIKE '%Teste%'
GROUP BY a.id, a.titulo, a.status, a.data_hora
ORDER BY a.created_at DESC
LIMIT 1;
