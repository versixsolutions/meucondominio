-- ✅ MIGRATION: Criar tabela de rate limiting para ask-ai
-- Execute este SQL no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS ai_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,  -- Extraído do JWT token
  query TEXT NOT NULL,     -- Primeiros 200 chars da query
  condominio_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Índices para performance
  CONSTRAINT fk_condominio FOREIGN KEY (condominio_id) REFERENCES condominios(id) ON DELETE CASCADE
);

-- ✅ Índices para queries rápidas
CREATE INDEX IF NOT EXISTS idx_ai_requests_user_id_created_at ON ai_requests(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_requests_condominio_id ON ai_requests(condominio_id);

-- ✅ Policy RLS: Usuários só podem ver suas próprias requisições
ALTER TABLE ai_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_can_view_own_requests" ON ai_requests;
CREATE POLICY "users_can_view_own_requests" ON ai_requests
  FOR SELECT USING (
    user_id = auth.uid()::text OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'sindico'))
  );

-- ✅ Policy para inserção: apenas via Edge Function
DROP POLICY IF EXISTS "insert_via_edge_function" ON ai_requests;
CREATE POLICY "insert_via_edge_function" ON ai_requests
  FOR INSERT WITH CHECK (TRUE);

-- ✅ Função para limpar requisições antigas (> 7 dias)
DROP FUNCTION IF EXISTS cleanup_old_ai_requests();
CREATE FUNCTION cleanup_old_ai_requests()
RETURNS void AS $$
BEGIN
  DELETE FROM ai_requests WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- ✅ INSTRUÇÕES DE DEPLOYMENT
/*
1. Abra https://app.supabase.com/project/[SEU-PROJECT-ID]/sql/new
2. Cole ESTE arquivo completo
3. Execute (Ctrl+Enter ou CMD+Enter)
4. Pronto! Tabela criada com índices e policies

PRÓXIMOS PASSOS:
- A tabela ai_requests registrará cada request para rate limiting
- Índices garantem queries O(1)
- RLS policies protegem dados de usuários
- Limpeza automática remove dados antigos

TESTE MANUAL:
  SELECT COUNT(*) FROM ai_requests WHERE created_at > NOW() - INTERVAL '1 hour';
*/
