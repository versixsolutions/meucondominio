-- =================================================================================
-- SCHEMA SQL PARA SUPABASE - CONDEMIX
-- Implementação de Tabelas, Chaves Estrangeiras e Row Level Security (RLS)
-- =================================================================================

-- Políticas de RLS para users (usando a função get_user_role)
-- Extensão da tabela auth.users do Supabase
CREATE TABLE public.users (
    id uuid references auth.users not null primary key,
    email text unique not null,
    full_name text,
    role text not null default 'morador' check (role in ('morador', 'sindico', 'admin', 'pending')),
    unit_number text,
    phone text,
    created_at timestamp with time zone default now()
);

-- Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. FUNÇÃO AUXILIAR PARA PEGAR O PERFIL DO USUÁRIO
-- Necessário para aplicar RLS baseado no 'role' (sindico, morador, admin)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
  RETURN user_role;
END;
$$;

-- Políticas de RLS para users (usando a função get_user_role)
-- Política: Usuário pode ler o próprio perfil
CREATE POLICY "Usuário pode ler o próprio perfil" ON public.users
FOR SELECT USING (auth.uid() = id);

-- Política: Sindico/Admin podem ler todos os perfis
CREATE POLICY "Sindico e Admin podem ler todos os perfis" ON public.users
FOR SELECT USING (get_user_role() IN ('sindico', 'admin'));

-- Política: Usuário pode atualizar o próprio perfil
CREATE POLICY "Usuário pode atualizar o próprio perfil" ON public.users
FOR UPDATE USING (auth.uid() = id);

-- Política: Admin pode atualizar qualquer perfil
CREATE POLICY "Admin pode atualizar qualquer perfil" ON public.users
FOR UPDATE USING (get_user_role() = 'admin');

-- 3. TABELA DE COMUNICADOS (comunicados)
CREATE TABLE public.comunicados (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    content text not null,
    type text not null check (type in ('geral', 'financeiro', 'urgente')),
    priority integer not null default 0,
    published_at timestamp with time zone default now(),
    author_id uuid references public.users(id)
);

ALTER TABLE public.comunicados ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler comunicados
CREATE POLICY "Todos podem ler comunicados" ON public.comunicados
FOR SELECT USING (true);

-- Política: Sindico e Admin podem criar, atualizar e deletar
CREATE POLICY "Sindico e Admin podem gerenciar comunicados" ON public.comunicados
FOR ALL USING (get_user_role() IN ('sindico', 'admin')) WITH CHECK (get_user_role() IN ('sindico', 'admin'));

-- 4. TABELA DE ANEXOS DE COMUNICADOS (comunicado_attachments)
CREATE TABLE public.comunicado_attachments (
    id uuid primary key default gen_random_uuid(),
    comunicado_id uuid references public.comunicados(id) on delete cascade,
    file_url text not null,
    file_name text not null
);

ALTER TABLE public.comunicado_attachments ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler anexos (se puderem ler o comunicado)
CREATE POLICY "Todos podem ler anexos" ON public.comunicado_attachments
FOR SELECT USING (EXISTS (SELECT 1 FROM public.comunicados WHERE id = comunicado_id));

-- Política: Sindico e Admin podem gerenciar anexos
CREATE POLICY "Sindico e Admin podem gerenciar anexos" ON public.comunicado_attachments
FOR ALL USING (get_user_role() IN ('sindico', 'admin')) WITH CHECK (get_user_role() IN ('sindico', 'admin'));

-- 5. TABELA DE LEITURAS DE COMUNICADOS (comunicado_reads)
CREATE TABLE public.comunicado_reads (
    id uuid primary key default gen_random_uuid(),
    comunicado_id uuid references public.comunicados(id) on delete cascade,
    user_id uuid references public.users(id) on delete cascade,
    read_at timestamp with time zone default now(),
    UNIQUE (comunicado_id, user_id) -- Garante que o usuário só marca como lido uma vez
);

ALTER TABLE public.comunicado_reads ENABLE ROW LEVEL SECURITY;

-- Política: Usuário pode criar um registro de leitura (marcar como lido)
CREATE POLICY "Usuário pode criar registro de leitura" ON public.comunicado_reads
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política: Usuário pode ler seus próprios registros de leitura
CREATE POLICY "Usuário pode ler seus próprios registros de leitura" ON public.comunicado_reads
FOR SELECT USING (auth.uid() = user_id);

-- 6. TABELA DE OCORRÊNCIAS (ocorrencias)
CREATE TABLE public.ocorrencias (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text not null,
    status text not null default 'aberto' check (status in ('aberto', 'em_andamento', 'resolvido', 'arquivado')),
    created_at timestamp with time zone default now(),
    resolved_at timestamp with time zone,
    author_id uuid references public.users(id),
    handler_id uuid references public.users(id) -- Quem está tratando (sindico/admin)
);

ALTER TABLE public.ocorrencias ENABLE ROW LEVEL SECURITY;

-- Política: Usuário pode criar ocorrência
CREATE POLICY "Usuário pode criar ocorrência" ON public.ocorrencias
FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Política: Usuário pode ler suas próprias ocorrências
CREATE POLICY "Usuário pode ler suas próprias ocorrências" ON public.ocorrencias
FOR SELECT USING (auth.uid() = author_id);

-- Política: Sindico/Admin podem ler e atualizar todas as ocorrências
CREATE POLICY "Sindico e Admin podem gerenciar ocorrências" ON public.ocorrencias
FOR ALL USING (get_user_role() IN ('sindico', 'admin')) WITH CHECK (get_user_role() IN ('sindico', 'admin'));

-- 7. TABELA DE DESPESAS (despesas)
CREATE TABLE public.despesas (
    id uuid primary key default gen_random_uuid(),
    description text not null,
    amount numeric(10, 2) not null,
    due_date date not null,
    paid_at date,
    category text, -- Poderia ser uma tabela separada (despesa_categories)
    created_at timestamp with time zone default now(),
    author_id uuid references public.users(id) -- Quem registrou (sindico/admin)
);

ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler despesas (Transparência)
CREATE POLICY "Todos podem ler despesas" ON public.despesas
FOR SELECT USING (true);

-- Política: Sindico e Admin podem gerenciar despesas
CREATE POLICY "Sindico e Admin podem gerenciar despesas" ON public.despesas
FOR ALL USING (get_user_role() IN ('sindico', 'admin')) WITH CHECK (get_user_role() IN ('sindico', 'admin'));

-- 8. TABELA DE VOTAÇÕES (votacoes)
CREATE TABLE public.votacoes (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text not null,
    options jsonb not null, -- Ex: [{"id": 1, "text": "Sim"}, {"id": 2, "text": "Não"}]
    start_date timestamp with time zone default now(),
    end_date timestamp with time zone not null,
    is_secret boolean not null default true,
    created_at timestamp with time zone default now(),
    author_id uuid references public.users(id)
);

ALTER TABLE public.votacoes ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler votações ativas
CREATE POLICY "Todos podem ler votações ativas" ON public.votacoes
FOR SELECT USING (now() BETWEEN start_date AND end_date);

-- Política: Sindico e Admin podem gerenciar votações
CREATE POLICY "Sindico e Admin podem gerenciar votações" ON public.votacoes
FOR ALL USING (get_user_role() IN ('sindico', 'admin')) WITH CHECK (get_user_role() IN ('sindico', 'admin'));

-- 9. TABELA DE VOTOS (votos)
CREATE TABLE public.votos (
    id uuid primary key default gen_random_uuid(),
    votacao_id uuid references public.votacoes(id) on delete cascade,
    user_id uuid references public.users(id) on delete cascade,
    option_id integer not null, -- ID da opção dentro do JSONB de votacoes.options
    voted_at timestamp with time zone default now(),
    UNIQUE (votacao_id, user_id) -- Garante voto único por usuário
);

ALTER TABLE public.votos ENABLE ROW LEVEL SECURITY;

-- Política: Usuário pode votar (criar voto)
CREATE POLICY "Usuário pode criar voto" ON public.votos
FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.votacoes WHERE id = votacao_id AND now() BETWEEN start_date AND end_date));

-- Política: Admin pode ler todos os votos (para auditoria)
CREATE POLICY "Admin pode ler todos os votos" ON public.votos
FOR SELECT USING (get_user_role() = 'admin');

-- Política: Morador só pode ler seus próprios votos
CREATE POLICY "Morador pode ler seus próprios votos" ON public.votos
FOR SELECT USING (auth.uid() = user_id);

-- 10. TABELA DE FAQS (faqs)
CREATE TABLE public.faqs (
    id uuid primary key default gen_random_uuid(),
    question text not null,
    answer text not null,
    category text, -- Poderia ser uma tabela separada (faq_categories)
    created_at timestamp with time zone default now(),
    author_id uuid references public.users(id) -- Quem criou (sindico/admin)
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler FAQs
CREATE POLICY "Todos podem ler FAQs" ON public.faqs
FOR SELECT USING (true);

-- Política: Sindico e Admin podem gerenciar FAQs
CREATE POLICY "Sindico e Admin podem gerenciar FAQs" ON public.faqs
FOR ALL USING (get_user_role() IN ('sindico', 'admin')) WITH CHECK (get_user_role() IN ('sindico', 'admin'));

-- 11. TRIGGER PARA INSERIR PERFIL APÓS NOVO USUÁRIO
-- Garante que um registro na tabela 'users' é criado automaticamente após o 'signup'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'pending'); -- Novo usuário começa como 'pending'
  RETURN NEW;
END;
$$;

-- Cria o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =================================================================================
-- FIM DO SCHEMA SQL
-- =================================================================================
