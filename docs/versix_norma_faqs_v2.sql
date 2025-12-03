-- ============================================================================
-- VERSIX NORMA - BASE DE CONHECIMENTO REFORMULADA v2.0
-- ============================================================================
-- Autor: Ângelo (CEO Versix Solutions)
-- Data: Dezembro 2024
-- Objetivo: 300 FAQs otimizados para RAG com embeddings reais
-- ============================================================================

-- ============================================================================
-- PARTE 1: LIMPEZA E NOVO SCHEMA
-- ============================================================================

-- Dropar tabela antiga (se existir)
DROP TABLE IF EXISTS public.faqs CASCADE;

-- Criar nova tabela com schema otimizado
CREATE TABLE public.faqs (
    -- Identificação
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominio_id UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
    
    -- Conteúdo principal
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    
    -- Categorização granular (20 categorias)
    category TEXT NOT NULL CHECK (category IN (
        'area_lazer_piscina',
        'area_lazer_festas', 
        'area_lazer_esportes',
        'animais_passeio',
        'animais_restricoes',
        'financeiro_pagamento',
        'financeiro_cobranca',
        'seguranca_acesso',
        'seguranca_emergencia',
        'obras_pequenas',
        'obras_grandes',
        'governanca_assembleia',
        'governanca_sindico',
        'conflitos_vizinhos',
        'conflitos_multas',
        'horarios_silencio',
        'horarios_servicos',
        'lixo_coleta',
        'lixo_reciclagem',
        'veiculos_estacionamento'
    )),
    
    -- Metadados para RAG
    tags TEXT[] DEFAULT '{}', -- Para filtros adicionais
    keywords TEXT[] DEFAULT '{}', -- Palavras-chave para busca
    
    -- Referências
    article_reference TEXT, -- "Artigo 34º, Parágrafo 5º"
    legal_source TEXT, -- "Lei 10.406/2002 (Código Civil), Art. 1.336"
    
    -- Tipificação
    scenario_type TEXT CHECK (scenario_type IN ('simple', 'conflict', 'emergency', 'procedural', 'educational')),
    tone TEXT DEFAULT 'friendly' CHECK (tone IN ('formal', 'friendly', 'warning', 'urgent')),
    
    -- Prioridade e relacionamentos
    priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 4),
    related_faq_ids UUID[] DEFAULT '{}',
    
    -- Flags operacionais
    requires_sindico_action BOOLEAN DEFAULT false,
    requires_assembly_decision BOOLEAN DEFAULT false,
    has_legal_implications BOOLEAN DEFAULT false,
    
    -- Variações de pergunta (para melhorar hit rate)
    question_variations TEXT[] DEFAULT '{}',
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    helpful_votes INTEGER DEFAULT 0,
    unhelpful_votes INTEGER DEFAULT 0,
    
    -- Auditoria
    author_id UUID, -- Quem criou
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Índices para performance
    CONSTRAINT faq_question_unique UNIQUE (condominio_id, question)
);

-- Índices para otimização de queries
CREATE INDEX idx_faqs_category ON public.faqs(category);
CREATE INDEX idx_faqs_priority ON public.faqs(priority);
CREATE INDEX idx_faqs_condominio ON public.faqs(condominio_id);
CREATE INDEX idx_faqs_tags ON public.faqs USING gin(tags);
CREATE INDEX idx_faqs_keywords ON public.faqs USING gin(keywords);
CREATE INDEX idx_faqs_scenario ON public.faqs(scenario_type);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON public.faqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moradores podem ler FAQs do seu condomínio"
ON public.faqs FOR SELECT
USING (condominio_id = (SELECT condominio_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Síndicos e admins podem gerenciar FAQs"
ON public.faqs FOR ALL
USING (get_user_role() IN ('sindico', 'admin'))
WITH CHECK (get_user_role() IN ('sindico', 'admin'));

-- ============================================================================
-- PARTE 2: POPULAÇÃO COM 300 FAQs OTIMIZADOS
-- ============================================================================

-- NOTA: Usar o condominio_id do Pinheiro Park
-- condominio_id: 5c624180-5fca-41fd-a5a0-a6e724f45d96

-- ============================================================================
-- CATEGORIA 1: ÁREA DE LAZER - PISCINA (35 FAQs)
-- ============================================================================

INSERT INTO public.faqs (question, answer, category, tags, keywords, article_reference, scenario_type, tone, priority, question_variations, condominio_id) VALUES

-- Pergunta 1
('Qual o horário de funcionamento da piscina?',
'A piscina funciona das 06h00 às 23h00 todos os dias. Durante o horário de silêncio (22h-6h), o uso é proibido, mas há 1 hora de tolerância até 23h.',
'area_lazer_piscina',
ARRAY['horario', 'piscina', 'funcionamento'],
ARRAY['piscina', 'horario', 'abre', 'fecha', 'funcionamento'],
'Artigo 4º',
'simple',
'friendly',
1,
ARRAY['Que horas abre a piscina?', 'Até que horas posso usar a piscina?', 'Piscina funciona de madrugada?'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 2
('Posso levar amigos para a piscina?',
'Sim, até 4 convidados por unidade. Acima de 4 pessoas, você precisa reservar a área de lazer completa. Você é responsável por qualquer acidente com seus convidados.',
'area_lazer_piscina',
ARRAY['convidados', 'piscina', 'amigos'],
ARRAY['amigos', 'convidados', 'visita', 'piscina', 'quantos'],
'Artigos 28º e 29º',
'simple',
'friendly',
1,
ARRAY['Quantas pessoas posso levar na piscina?', 'Meus amigos podem usar a piscina?', 'Tem limite de convidados na piscina?'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 3
('Minha empregada pode usar a piscina comigo?',
'Não. Empregados domésticos não podem usar a piscina, mesmo acompanhados do patrão. Isso protege o condomínio de questões trabalhistas em caso de acidente (Art. 28º §1º). Esta regra vale para toda equipe de apoio doméstico.',
'area_lazer_piscina',
ARRAY['empregada', 'piscina', 'proibicao'],
ARRAY['empregada', 'domestica', 'babá', 'piscina', 'trabalhista'],
'Artigo 28º - Parágrafo 1º',
'conflict',
'formal',
2,
ARRAY['Babá pode entrar na piscina?', 'Funcionária doméstica pode nadar?', 'Empregado pode usar área de lazer?'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 4
('Pode usar copo de vidro na piscina?',
'Não. É terminantemente proibido usar copos, garrafas de vidro ou descartáveis na piscina ou em toda a borda. Use apenas copos plásticos reutilizáveis e mantenha alimentos e bebidas nas mesas.',
'area_lazer_piscina',
ARRAY['vidro', 'proibicao', 'seguranca'],
ARRAY['vidro', 'copo', 'garrafa', 'cerveja', 'proibido'],
'Artigo 30º - IV',
'simple',
'warning',
2,
ARRAY['Posso levar cerveja de vidro?', 'Pode garrafa de vidro na piscina?', 'Por que não pode vidro?'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergua 5
('Posso usar óleo bronzeador na piscina?',
'Não. Óleos bronzeadores e similares são proibidos porque contaminam a água. Protetor solar é permitido, pois tem formulação adequada para piscinas.',
'area_lazer_piscina',
ARRAY['bronzeador', 'protetor', 'regras'],
ARRAY['bronzeador', 'oleo', 'protetor solar', 'mancha'],
'Artigo 30º - VI',
'simple',
'friendly',
3,
ARRAY['Pode passar bronzeador?', 'Protetor solar é permitido?', 'Por que não pode óleo?'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 6
('Pode nadar de roupa jeans na piscina?',
'Não. Roupas jeans, bermudas de tecido grosso e similares são proibidas. Use apenas trajes de banho apropriados (sunga, maiô, biquíni, shorts de tactel).',
'area_lazer_piscina',
ARRAY['roupa', 'jeans', 'traje'],
ARRAY['jeans', 'calça', 'roupa', 'short', 'bermuda'],
'Artigo 30º - V',
'simple',
'friendly',
3,
ARRAY['Posso entrar de short?', 'Que roupa usar na piscina?', 'Pode bermuda jeans?'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 7
('Meu cachorro pode entrar na piscina?',
'Não. Animais são terminantemente proibidos na área da piscina e em toda área de lazer (salão, quadra, playground). Há uma área pet específica para recreação dos pets.',
'area_lazer_piscina',
ARRAY['cachorro', 'animal', 'proibicao'],
ARRAY['cachorro', 'cao', 'pet', 'animal', 'piscina'],
'Artigo 34º - Parágrafo 5º',
'simple',
'warning',
2,
ARRAY['Pet pode ir na piscina?', 'Cachorro pode nadar?', 'Animal na área de lazer?'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 8
('Aconteceu um acidente na piscina, quem é responsável?',
'A responsabilidade é exclusiva do condômino. O síndico e funcionários do condomínio NÃO se responsabilizam por acidentes. Você deve supervisionar seus filhos e convidados. O condomínio também não se responsabiliza por objetos perdidos ou furtados.',
'area_lazer_piscina',
ARRAY['acidente', 'responsabilidade', 'legal'],
ARRAY['acidente', 'afogamento', 'queda', 'machucado', 'responsavel'],
'Artigo 29º',
'educational',
'formal',
1,
ARRAY['Quem paga se alguém se afogar?', 'Condomínio responde por acidente?', 'Criança se machucou na piscina'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 9
('Posso fazer churrasco na beira da piscina?',
'Sim, mas é necessário reservar a área de lazer se você tiver mais de 4 convidados. Lembre-se: sem vidro, sem som alto após 22h, e limpeza é sua responsabilidade.',
'area_lazer_piscina',
ARRAY['churrasco', 'piscina', 'uso'],
ARRAY['churrasco', 'churrasqueira', 'grelha', 'piscina'],
'Artigos 27º e 28º',
'simple',
'friendly',
2,
ARRAY['Pode churrasquear na piscina?', 'Tem churrasqueira perto da piscina?', 'Fazer comida na área da piscina'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 10
('A piscina está suja, o que fazer?',
'Abra uma ocorrência no app do condomínio ou informe diretamente ao síndico/portaria. A manutenção é responsabilidade do zelador, mas a limpeza depende da colaboração de todos.',
'area_lazer_piscina',
ARRAY['limpeza', 'manutencao', 'reclamacao'],
ARRAY['suja', 'limpeza', 'manutencao', 'zelador', 'piscina'],
'Artigo 63º',
'procedural',
'friendly',
3,
ARRAY['Piscina está com folha', 'Quem limpa a piscina?', 'Reclamar da piscina suja'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 11
('Posso fazer aula de natação particular na piscina?',
'Não. Atividades profissionais, aulas particulares e uso comercial são proibidos. A piscina é exclusivamente para lazer dos moradores e convidados.',
'area_lazer_piscina',
ARRAY['aula', 'natacao', 'proibicao'],
ARRAY['aula', 'natacao', 'professor', 'particular', 'comercial'],
'Artigo 47º',
'simple',
'formal',
3,
ARRAY['Pode contratar professor de natação?', 'Aula na piscina do condomínio?', 'Atividade comercial na piscina'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 12
('Criança pequena pode ir sozinha na piscina?',
'Não é recomendado e nem permitido sem supervisão. Crianças SEMPRE devem estar acompanhadas de um adulto responsável. Em caso de acidente, a responsabilidade é dos pais/responsáveis.',
'area_lazer_piscina',
ARRAY['crianca', 'supervisao', 'seguranca'],
ARRAY['crianca', 'filho', 'sozinho', 'supervisao', 'afogamento'],
'Artigo 29º',
'warning',
'urgent',
1,
ARRAY['Filho pode nadar sozinho?', 'Criança sem adulto na piscina?', 'Menor desacompanhado'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 13
('Posso reservar a piscina só para mim?',
'Sim, mediante reserva da área de lazer completa. No dia reservado, toda a área (piscina, churrasqueira, salão) fica de uso exclusivo do locatário. Taxa de 30% da cota condominial.',
'area_lazer_piscina',
ARRAY['reserva', 'exclusiva', 'piscina'],
ARRAY['reservar', 'exclusivo', 'privatizar', 'piscina', 'taxa'],
'Artigos 20º, 23º e 27º',
'procedural',
'friendly',
2,
ARRAY['Como reservar piscina só pra mim?', 'Piscina exclusiva como?', 'Privatizar área da piscina'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 14
('Alguém está comportando-se mal na piscina, o que fazer?',
'Comunique imediatamente à portaria ou síndico. Comportamentos que firam a moral, bons costumes ou decência são proibidos. Registre no livro de ocorrências.',
'area_lazer_piscina',
ARRAY['comportamento', 'denuncia', 'regras'],
ARRAY['comportamento', 'indecente', 'briga', 'denuncia', 'moral'],
'Artigos 19º e 65º',
'conflict',
'formal',
2,
ARRAY['Casal se pegando na piscina', 'Comportamento impróprio área comum', 'Pessoa nua na piscina'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 15
('A piscina está interditada, por quê?',
'A piscina pode ser interditada por: manutenção programada, problemas na água (pH, cloro), limpeza profunda, ou reserva para evento privado. Verifique avisos na portaria ou app do condomínio.',
'area_lazer_piscina',
ARRAY['interdicao', 'manutencao', 'fechada'],
ARRAY['interditada', 'fechada', 'manutencao', 'problema', 'agua'],
'Artigo 28º - Parágrafo 2º',
'simple',
'friendly',
3,
ARRAY['Por que a piscina está fechada?', 'Piscina em manutenção', 'Não consigo usar a piscina'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 16
('Posso levar comida para comer na piscina?',
'Sim, mas NÃO na borda da piscina. Alimentos devem ser consumidos nas mesas da área de lazer. Isso evita contaminação da água e atração de insetos.',
'area_lazer_piscina',
ARRAY['comida', 'alimento', 'regras'],
ARRAY['comida', 'lanche', 'alimento', 'borda', 'mesa'],
'Artigo 30º - IV',
'simple',
'friendly',
3,
ARRAY['Pode comer na piscina?', 'Lanche na beira da água?', 'Onde comer na área de lazer'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 17
('Tem boia salva-vidas na piscina?',
'Verifique com o síndico sobre equipamentos de segurança disponíveis. Por lei, piscinas de uso coletivo devem ter boia, gancho e caixa de primeiros socorros.',
'area_lazer_piscina',
ARRAY['seguranca', 'equipamento', 'boia'],
ARRAY['boia', 'salva-vidas', 'seguranca', 'emergencia', 'afogamento'],
'Artigo 29º e Lei Federal 13.005/2014',
'educational',
'formal',
2,
ARRAY['Onde fica a boia?', 'Equipamento de salvamento?', 'Piscina tem boia?'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 18
('Posso usar máscara de mergulho e snorkel?',
'Sim, desde que não atrapalhe outros usuários e seja usado com segurança. Equipamentos pessoais de natação são permitidos.',
'area_lazer_piscina',
ARRAY['equipamento', 'mergulho', 'uso'],
ARRAY['mascara', 'snorkel', 'nadadeira', 'mergulho', 'equipamento'],
'Artigos gerais de uso comum',
'simple',
'friendly',
4,
ARRAY['Pode nadadeira?', 'Equipamento de mergulho é permitido?', 'Snorkel na piscina'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 19
('Vi alguém urinando na piscina, o que fazer?',
'Comunique imediatamente ao síndico/portaria. Esse comportamento é anti-higiênico, viola as normas do condomínio e pode resultar em advertência/multa. Registre no livro de ocorrências.',
'area_lazer_piscina',
ARRAY['higiene', 'denuncia', 'comportamento'],
ARRAY['urinar', 'xixi', 'coco', 'higiene', 'nojento'],
'Artigo 30º - I',
'conflict',
'warning',
2,
ARRAY['Pessoa fez xixi na piscina', 'Como denunciar falta de higiene?', 'Comportamento nojento na piscina'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 20
('Gestante pode usar a piscina?',
'Sim, mas recomenda-se consultar o médico antes. A responsabilidade por qualquer problema é exclusiva da gestante. Evite horários de grande movimento.',
'area_lazer_piscina',
ARRAY['gestante', 'saude', 'cuidados'],
ARRAY['gravida', 'gestante', 'barriga', 'prenha', 'saude'],
'Artigo 31º (condição de saúde)',
'educational',
'friendly',
3,
ARRAY['Grávida pode nadar?', 'Piscina para gestante faz mal?', 'Barriguda pode usar piscina'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 21
('Tem limite de tempo para ficar na piscina?',
'Não há limite de tempo, desde que você respeite o horário de funcionamento (6h-23h) e não impeça o uso pelos demais moradores.',
'area_lazer_piscina',
ARRAY['tempo', 'limite', 'uso'],
ARRAY['tempo', 'horas', 'quanto tempo', 'limite', 'ficar'],
'Artigo 16º',
'simple',
'friendly',
4,
ARRAY['Quanto tempo posso ficar?', 'Tem rodízio de horário?', 'Posso passar o dia inteiro?'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 22
('Posso fazer hidromassagem com jet na piscina?',
'Não é recomendado usar equipamentos elétricos na piscina por questões de segurança. Consulte o síndico antes de instalar qualquer equipamento.',
'area_lazer_piscina',
ARRAY['equipamento', 'eletrico', 'seguranca'],
ARRAY['hidromassagem', 'jet', 'eletrico', 'equipamento', 'seguranca'],
'Artigo 42º (segurança)',
'warning',
'formal',
3,
ARRAY['Jet portátil pode?', 'Equipamento elétrico na piscina?', 'Hidro na piscina'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 23
('A água da piscina está verde, o que fazer?',
'Abra ocorrência imediatamente. Água verde indica proliferação de algas por falta de manutenção. O zelador deve tratar com urgência. Não use até normalizar.',
'area_lazer_piscina',
ARRAY['manutencao', 'problema', 'agua'],
ARRAY['agua verde', 'alga', 'problema', 'cloro', 'ph'],
'Artigo 63º',
'emergency',
'urgent',
1,
ARRAY['Piscina está com alga', 'Água esverdeada na piscina', 'Piscina suja de verde'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 24
('Posso fazer aniversário infantil na piscina?',
'Sim, mediante reserva da área de lazer. Você terá uso exclusivo da piscina, churrasqueira e salão. Taxa de 30% da cota condominial. Máximo 100 convidados.',
'area_lazer_piscina',
ARRAY['festa', 'aniversario', 'reserva'],
ARRAY['aniversario', 'festa', 'infantil', 'crianca', 'reserva'],
'Artigos 20º, 21º e 23º',
'procedural',
'friendly',
2,
ARRAY['Como fazer festa na piscina?', 'Aniversário de criança na área de lazer', 'Reservar piscina para festa'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 25
('Alguém está fumando na piscina, pode?',
'Não há proibição explícita no regimento, mas o fumo deve respeitar o bem-estar dos demais. Se houver incômodo, pode ser considerado perturbação e gerar advertência.',
'area_lazer_piscina',
ARRAY['fumo', 'cigarro', 'regras'],
ARRAY['fumar', 'cigarro', 'vape', 'tabaco', 'fumo'],
'Artigo 19º (bem-estar)',
'educational',
'friendly',
3,
ARRAY['Pode fumar cigarro?', 'Fumo na área comum?', 'Vape na piscina'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 26
('Posso usar caixa de som na piscina?',
'Sim, mas em volume moderado que não perturbe os demais moradores. Após 22h (23h em julho, dezembro e janeiro), o som deve ser desligado ou reduzido drasticamente.',
'area_lazer_piscina',
ARRAY['som', 'musica', 'barulho'],
ARRAY['som', 'caixa', 'musica', 'barulho', 'volume'],
'Artigos 1º e 2º',
'simple',
'friendly',
2,
ARRAY['Pode música na piscina?', 'Som alto na área de lazer', 'Barulho na piscina'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 27
('Vi fezes de animal na área da piscina',
'Comunique imediatamente ao zelador/portaria para limpeza urgente. Identifique o dono do animal se possível - animais são PROIBIDOS na área de lazer. O dono pode ser multado.',
'area_lazer_piscina',
ARRAY['animal', 'higiene', 'denuncia'],
ARRAY['fezes', 'coco', 'cachorro', 'animal', 'sujeira'],
'Artigos 34º §5º e 79º',
'emergency',
'urgent',
1,
ARRAY['Cocô de cachorro na piscina', 'Animal fez sujeira', 'Fezes na área comum'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 28
('Posso fotografar/filmar na piscina?',
'Sim, mas respeite a privacidade dos demais moradores. Não filme pessoas sem autorização. Não é permitido filmar para fins comerciais ou divulgação em redes sociais sem consentimento.',
'area_lazer_piscina',
ARRAY['foto', 'video', 'privacidade'],
ARRAY['foto', 'video', 'filmar', 'camera', 'privacidade'],
'Artigo 59º e Lei Geral de Proteção de Dados',
'educational',
'formal',
3,
ARRAY['Pode tirar foto na piscina?', 'Filmar área comum?', 'Câmera na piscina'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 29
('A piscina tem raia para natação?',
'Verifique com o síndico. Caso não tenha, você pode sugerir em assembleia a instalação de raias flutuantes. Respeite sempre quem está treinando.',
'area_lazer_piscina',
ARRAY['raia', 'natacao', 'esporte'],
ARRAY['raia', 'natacao', 'treino', 'nadar', 'esporte'],
'Artigo 63º (sugestões)',
'simple',
'friendly',
4,
ARRAY['Tem raia olímpica?', 'Posso treinar natação?', 'Piscina de 25m?'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 30
('Estou com doença de pele, posso usar a piscina?',
'Não é recomendado e pode ser proibido por questão de saúde pública. Doenças infecto-contagiosas devem ser comunicadas ao síndico. Aguarde recuperação completa.',
'area_lazer_piscina',
ARRAY['saude', 'doenca', 'contagio'],
ARRAY['doenca', 'ferida', 'micose', 'infeccao', 'contagioso'],
'Artigo 31º',
'warning',
'formal',
2,
ARRAY['Pode nadar com micose?', 'Ferida na piscina', 'Doença contagiosa e piscina'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 31
('Quero sugerir aquecimento da piscina',
'Envie sugestão por escrito ao síndico ou apresente em assembleia. Melhorias que gerem custo precisam de aprovação dos condôminos.',
'area_lazer_piscina',
ARRAY['sugestao', 'melhoria', 'aquecimento'],
ARRAY['aquecimento', 'aquecedor', 'sugestao', 'melhoria', 'assembleia'],
'Artigos 63º e 85º',
'procedural',
'friendly',
4,
ARRAY['Como aquecer a piscina?', 'Sugestão de melhoria', 'Piscina aquecida'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 32
('Vi criança pulando de cabeça em piscina rasa',
'Alerte imediatamente os responsáveis sobre o perigo. Pular de cabeça em piscina rasa pode causar traumatismo craniano grave. Se necessário, comunique ao síndico.',
'area_lazer_piscina',
ARRAY['seguranca', 'acidente', 'crianca'],
ARRAY['pular', 'mergulhar', 'cabeça', 'raso', 'perigo'],
'Artigo 29º (responsabilidade)',
'warning',
'urgent',
1,
ARRAY['Criança pulando na parte rasa', 'Perigo de acidente na piscina', 'Mergulho perigoso'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 33
('Posso usar boia inflável grande na piscina?',
'Sim, desde que não atrapalhe o uso pelos demais moradores. Em dias de grande movimento, evite boias muito grandes. Priorize sempre o uso coletivo.',
'area_lazer_piscina',
ARRAY['boia', 'inflavel', 'uso'],
ARRAY['boia', 'inflavel', 'grande', 'unicornio', 'flamingo'],
'Artigo 16º (uso comum)',
'simple',
'friendly',
3,
ARRAY['Pode boia de unicórnio?', 'Inflável grande permitido?', 'Boia gigante na piscina'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 34
('A piscina tem parte rasa para criança?',
'Verifique com o síndico as especificações técnicas da piscina (profundidade em cada ponto). Mesmo na parte rasa, crianças devem estar sempre acompanhadas.',
'area_lazer_piscina',
ARRAY['profundidade', 'crianca', 'seguranca'],
ARRAY['raso', 'fundo', 'profundidade', 'crianca', 'altura'],
'Artigo 29º',
'simple',
'friendly',
2,
ARRAY['Qual a profundidade?', 'Tem parte infantil?', 'Piscina rasa?'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 35
('Posso trancar minhas coisas em algum lugar?',
'O condomínio NÃO se responsabiliza por objetos perdidos ou furtados. Leve apenas o necessário e mantenha seus pertences à vista. Não há armários com chave.',
'area_lazer_piscina',
ARRAY['pertences', 'seguranca', 'armario'],
ARRAY['armario', 'guardar', 'chave', 'celular', 'carteira'],
'Artigo 29º',
'educational',
'friendly',
3,
ARRAY['Onde guardar celular?', 'Tem armário?', 'Condomínio responde por furto?'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96');

-- ============================================================================
-- CATEGORIA 2: ÁREA DE LAZER - FESTAS (30 FAQs)
-- ============================================================================

INSERT INTO public.faqs (question, answer, category, tags, keywords, article_reference, scenario_type, tone, priority, question_variations, condominio_id, requires_sindico_action) VALUES

-- Pergunta 36
('Como reservar o salão de festas?',
'Reservas devem ser feitas pelo site da Predial Administradora com antecedência mínima de 5 dias. Prioridade para o primeiro solicitante. É necessário estar em dia com as taxas condominiais e assinar Termo de Responsabilidade.',
'area_lazer_festas',
ARRAY['reserva', 'salao', 'procedimento'],
ARRAY['reservar', 'salao', 'festa', 'site', 'administradora'],
'Artigos 22º e 23º',
'procedural',
'friendly',
1,
ARRAY['Como faço para reservar?', 'Reserva de salão de festa', 'Alugar espaço para evento'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 37
('Qual o valor para reservar a área de lazer?',
'Taxa de 30% da contribuição condominial fixa, destinada à limpeza do espaço. Essa taxa é incluída no boleto do mês. Pagamento pode ser feito via boleto ou diretamente no condomínio.',
'area_lazer_festas',
ARRAY['taxa', 'valor', 'pagamento'],
ARRAY['valor', 'preco', 'taxa', 'quanto custa', 'pagamento'],
'Artigo 23º - III',
'simple',
'friendly',
1,
ARRAY['Quanto custa reservar?', 'Preço do salão', 'Valor da taxa de reserva'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 38
('Posso fazer festa até que horas?',
'Festas podem ir até 01h00 da manhã (Art. 5º). O som e instrumentos musicais devem parar nesse horário. Respeite o horário de silêncio dos vizinhos.',
'area_lazer_festas',
ARRAY['horario', 'festa', 'limite'],
ARRAY['horario', 'ate quando', 'limite', 'madrugada', '1h'],
'Artigo 5º',
'simple',
'warning',
1,
ARRAY['Até que horas a festa?', 'Posso ficar até 2h?', 'Horário limite de música'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 39
('Quantas pessoas posso convidar?',
'Máximo de 100 convidados. Acima de 50 convidados, é obrigatória a contratação de segurança particular. É obrigatório apresentar lista completa à portaria com 4h de antecedência.',
'area_lazer_festas',
ARRAY['convidados', 'limite', 'lista'],
ARRAY['convidados', 'quantas pessoas', 'maximo', 'limite', 'lista'],
'Artigo 21º - Parágrafos 2º, 3º e 5º',
'simple',
'formal',
1,
ARRAY['Limite de pessoas na festa', 'Quantos convidados?', 'Precisa lista de nomes?'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 40
('Convidados podem trazer carro?',
'Não. Em dias de reserva da área de lazer, carros de convidados NÃO podem entrar no condomínio. Eles devem estacionar na rua externa.',
'area_lazer_festas',
ARRAY['convidados', 'carro', 'estacionamento'],
ARRAY['carro', 'veiculo', 'convidado', 'estacionar', 'garagem'],
'Artigo 21º - Parágrafo 4º',
'simple',
'warning',
2,
ARRAY['Visitante pode estacionar?', 'Carro de convidado entra?', 'Onde convidado estaciona'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 41
('Posso cancelar a reserva?',
'Sim, mas deve comunicar ao síndico com antecedência de 2 dias. Você pode alterar a data do evento. Cancelamentos de última hora podem gerar perda da taxa paga.',
'area_lazer_festas',
ARRAY['cancelamento', 'desistencia', 'prazo'],
ARRAY['cancelar', 'desistir', 'remarcar', 'prazo', 'aviso'],
'Artigo 24º',
'procedural',
'friendly',
2,
ARRAY['Como cancelar reserva?', 'Desistir da festa', 'Mudar data do evento'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
true),

-- Pergunta 42
('Quem limpa depois da festa?',
'A limpeza básica está incluída na taxa de 30%. Porém, você DEVE entregar o espaço em perfeito estado: sem decorações, sem lixo acumulado, sem móveis fora do lugar. Não entregar limpo gera multa de 100% da cota condominial.',
'area_lazer_festas',
ARRAY['limpeza', 'responsabilidade', 'multa'],
ARRAY['limpar', 'limpeza', 'sujeira', 'responsavel', 'multa'],
'Artigo 27º - Parágrafo 1º',
'warning',
'formal',
1,
ARRAY['Tenho que limpar?', 'Quem limpa o salão?', 'Multa por não limpar'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 43
('Posso decorar o salão?',
'Sim, mas não pode danificar paredes (pregos, fita dupla-face forte, cola). Use fitas apropriadas e retire TODA decoração ao final. Danos ao patrimônio geram cobrança de reparos.',
'area_lazer_festas',
ARRAY['decoracao', 'danos', 'responsabilidade'],
ARRAY['decorar', 'balao', 'enfeite', 'parede', 'danificar'],
'Artigo 69º',
'simple',
'friendly',
2,
ARRAY['Pode colocar balão?', 'Como decorar sem danificar?', 'Permitido pregar na parede'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 44
('Posso fazer festa no domingo?',
'Sim, qualquer dia exceto domingos e feriados. A área de lazer fica disponível para reserva de segunda a sábado, a partir das 15h.',
'area_lazer_festas',
ARRAY['domingo', 'feriado', 'disponibilidade'],
ARRAY['domingo', 'feriado', 'dia', 'permitido', 'fim de semana'],
'Artigo 20º',
'simple',
'friendly',
2,
ARRAY['Pode reservar domingo?', 'Festa em feriado?', 'Finais de semana disponível'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 45
('Sou inquilino, posso reservar?',
'Sim, desde que esteja em dia com as obrigações condominiais e assine o Termo de Responsabilidade. Inquilinos têm os mesmos direitos que proprietários.',
'area_lazer_festas',
ARRAY['inquilino', 'locatario', 'direito'],
ARRAY['inquilino', 'locatario', 'aluguel', 'direito', 'morador'],
'Artigo 21º',
'simple',
'friendly',
3,
ARRAY['Inquilino tem direito?', 'Morador de aluguel pode reservar?', 'Locatário pode fazer festa'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 46
('Posso contratar buffet?',
'Sim, mas o buffet deve se apresentar na portaria, seguir as normas do condomínio e você é responsável por qualquer dano causado pelos prestadores.',
'area_lazer_festas',
ARRAY['buffet', 'prestador', 'responsabilidade'],
ARRAY['buffet', 'fornecedor', 'comida', 'prestador', 'empresa'],
'Artigo 69º',
'simple',
'friendly',
3,
ARRAY['Pode trazer buffet de fora?', 'Empresa externa pode entrar?', 'Contratar serviço de festa'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 47
('Tenho que estar presente na festa?',
'Sim, é OBRIGATÓRIA a presença do proprietário/locatário que solicitou a reserva durante TODO o evento. Você é responsável pelos convidados.',
'area_lazer_festas',
ARRAY['presenca', 'obrigacao', 'responsabilidade'],
ARRAY['presença', 'obrigatorio', 'ficar', 'responsavel', 'ausentar'],
'Artigo 21º - Parágrafo 1º',
'warning',
'formal',
1,
ARRAY['Posso ir embora antes?', 'Preciso ficar na festa?', 'Obrigatório estar presente'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 48
('Posso emprestar minha reserva para outra pessoa?',
'NÃO. É terminantemente proibida a sublocação ou cessão da área de lazer. Fazer isso gera multa de 1 a 5 taxas condominiais, sem aviso prévio.',
'area_lazer_festas',
ARRAY['sublocacao', 'cessao', 'multa'],
ARRAY['emprestar', 'sublocar', 'ceder', 'amigo', 'proibido'],
'Artigo 21º',
'warning',
'urgent',
1,
ARRAY['Amigo pode usar minha reserva?', 'Emprestar salão', 'Ceder espaço'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 49
('Posso fazer evento comercial?',
'Não. A área de lazer é de uso EXCLUSIVAMENTE residencial e social. Proibido: atividades político-partidárias, religiosas, profissionais, mercantis ou comerciais.',
'area_lazer_festas',
ARRAY['comercial', 'proibicao', 'uso'],
ARRAY['comercial', 'negocio', 'venda', 'politica', 'religiao'],
'Artigo 21º',
'warning',
'formal',
2,
ARRAY['Pode fazer reunião de empresa?', 'Evento comercial permitido?', 'Vender produto na festa'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 50
('Alguém já reservou o dia que eu quero',
'Prioridade é por ordem de chegada (primeiro a solicitar). Se houver conflito, o síndico intermedia. Sugestão: faça reserva com antecedência (mínimo 5 dias).',
'area_lazer_festas',
ARRAY['conflito', 'prioridade', 'data'],
ARRAY['ocupado', 'reservado', 'outro dia', 'prioridade', 'primeiro'],
'Artigo 22º',
'procedural',
'friendly',
3,
ARRAY['Data já reservada', 'Como ter prioridade?', 'Conflito de datas'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
true),

-- Pergunta 51
('Posso usar o salão de dia sem reservar?',
'Sim, o uso diurno (até 15h) é liberado para todos os moradores, desde que você tenha até 4 convidados e não haja reserva para o dia. Se houver reserva, o espaço fica exclusivo a partir das 15h.',
'area_lazer_festas',
ARRAY['uso diurno', 'sem reserva', 'limite'],
ARRAY['dia', 'diurno', 'almoco', '4 pessoas', 'sem reservar'],
'Artigos 6º e 27º',
'simple',
'friendly',
2,
ARRAY['Pode usar sem reservar?', 'Almoço no salão', 'Uso livre do salão'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 52
('Danifiquei algo durante a festa',
'Comunique imediatamente ao síndico e assuma a responsabilidade do conserto. O valor do reparo será cobrado de você conforme orçamento apresentado. Não comunicar pode gerar multa adicional.',
'area_lazer_festas',
ARRAY['dano', 'quebra', 'responsabilidade'],
ARRAY['quebrar', 'dano', 'estragar', 'danificar', 'pagar'],
'Artigo 69º',
'procedural',
'formal',
1,
ARRAY['Quebrei algo na festa', 'Quem paga se quebrar?', 'Responsabilidade por dano'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
true),

-- Pergunta 53
('Convidados podem circular pelo condomínio?',
'Não. Convidados só podem utilizar a área reservada. É proibido circular por outras áreas comuns do condomínio.',
'area_lazer_festas',
ARRAY['convidados', 'circulacao', 'restricao'],
ARRAY['convidado', 'circular', 'andar', 'area', 'restrito'],
'Artigo 21º - Parágrafo 6º',
'warning',
'formal',
2,
ARRAY['Visitante pode andar no condomínio?', 'Convidado na área comum', 'Restrição de acesso'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 54
('Tem geladeira e fogão no salão?',
'Verifique com o síndico a relação de móveis e eletrodomésticos disponíveis. Itens básicos costumam incluir: geladeira, fogão, pia, mesas e cadeiras.',
'area_lazer_festas',
ARRAY['equipamentos', 'moveis', 'salao'],
ARRAY['geladeira', 'fogao', 'equipamento', 'movel', 'cadeira'],
'Artigo 23º',
'simple',
'friendly',
3,
ARRAY['O que tem no salão?', 'Equipamentos disponíveis?', 'Móveis do espaço'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
true),

-- Pergunta 55
('Posso levar meu próprio som?',
'Sim, mas respeite os limites de volume estabelecidos por lei e pelo regimento. Som excessivo após 22h (23h em julho/dez/jan) é infração grave.',
'area_lazer_festas',
ARRAY['som', 'musica', 'volume'],
ARRAY['som', 'caixa', 'musica', 'volume', 'barulho'],
'Artigos 5º e 26º',
'simple',
'warning',
2,
ARRAY['Pode som alto?', 'Música na festa', 'Limite de volume'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 56
('Reservei mas o espaço estava sujo',
'Comunique imediatamente ao síndico ANTES de usar. Registre fotos. O zelador deve limpar antes do seu horário. Se houver prejuízo ao seu evento, pode haver devolução parcial da taxa.',
'area_lazer_festas',
ARRAY['limpeza', 'reclamacao', 'problema'],
ARRAY['sujo', 'limpeza', 'zelador', 'reclamacao', 'problema'],
'Artigo 23º',
'procedural',
'formal',
1,
ARRAY['Salão não estava limpo', 'Reclamar de limpeza', 'Espaço sujo na hora'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
true),

-- Pergunta 57
('Posso fazer festa de casamento?',
'Sim, mediante reserva. Lembre-se do limite de 100 pessoas, contratação obrigatória de segurança acima de 50 convidados, e horário máximo até 01h.',
'area_lazer_festas',
ARRAY['casamento', 'evento', 'grande'],
ARRAY['casamento', 'bodas', 'enlace', 'matrimonio', 'festa grande'],
'Artigos 20º, 21º e 23º',
'simple',
'friendly',
3,
ARRAY['Casamento no condomínio', 'Festa grande permitida?', 'Bodas de prata no salão'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 58
('Vizinhos reclamaram do barulho da minha festa',
'Respeite o limite de 01h e os níveis de som permitidos. Reclamações frequentes podem gerar advertência e multa. Oriente seus convidados sobre as regras.',
'area_lazer_festas',
ARRAY['reclamacao', 'barulho', 'conflito'],
ARRAY['reclamacao', 'barulho', 'som', 'vizinho', 'multa'],
'Artigos 25º e 26º',
'conflict',
'warning',
2,
ARRAY['Vizinho reclamou da festa', 'Barulho incomodou', 'Posso ser multado por som'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 59
('Posso contratar DJ?',
'Sim, mas ele deve seguir as normas de horário e volume. O som deve parar às 01h. Você é responsável por orientar o profissional.',
'area_lazer_festas',
ARRAY['dj', 'musica', 'profissional'],
ARRAY['dj', 'musica', 'som', 'festa', 'profissional'],
'Artigo 5º',
'simple',
'friendly',
3,
ARRAY['Pode trazer DJ?', 'Som profissional na festa', 'DJ até que horas'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 60
('Fiz festa sem reservar',
'Isso é infração grave. Dependendo do caso (quantidade de pessoas, horário, danos), pode gerar multa imediata sem advertência prévia. Sempre reserve com antecedência.',
'area_lazer_festas',
ARRAY['infracao', 'multa', 'regras'],
ARRAY['sem reservar', 'infracao', 'multa', 'punição', 'ilegal'],
'Artigos 21º, 23º e 79º',
'warning',
'urgent',
1,
ARRAY['Festa sem autorização', 'Multa por não reservar', 'Usei sem permissão'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 61
('Posso fazer churrasco com amigos sem reservar?',
'Sim, desde que sejam ATÉ 4 convidados e não haja reserva no dia. Acima de 4 pessoas, é obrigatória a reserva da área de lazer.',
'area_lazer_festas',
ARRAY['churrasco', 'amigos', 'limite'],
ARRAY['churrasco', 'amigos', '4 pessoas', 'reserva', 'informal'],
'Artigo 23º - Parágrafo Único',
'simple',
'friendly',
2,
ARRAY['Churrasco de familia', 'Pode churrasquear sem reservar?', 'Almoço com amigos'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 62
('Como faço para contratar segurança?',
'A contratação é sua responsabilidade. Contrate empresa idônea, informe os dados à portaria. O segurança fica subordinado a você e deve seguir as regras do condomínio.',
'area_lazer_festas',
ARRAY['seguranca', 'contratacao', 'responsabilidade'],
ARRAY['seguranca', 'contratar', 'empresa', 'vigilante', 'obrigatorio'],
'Artigo 21º - Parágrafo 2º',
'procedural',
'formal',
3,
ARRAY['Onde contratar segurança?', 'Segurança obrigatório?', 'Vigilante para festa'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 63
('Posso fazer open bar?',
'Sim, mas bebidas alcoólicas devem ser consumidas com responsabilidade. Não é permitido vidro. Se algum convidado causar problema embriagado, você responde.',
'area_lazer_festas',
ARRAY['bebida', 'alcool', 'responsabilidade'],
ARRAY['open bar', 'bebida', 'alcool', 'cerveja', 'vodka'],
'Artigos 30º-IV e 69º',
'simple',
'friendly',
3,
ARRAY['Pode servir bebida?', 'Álcool na festa', 'Open bar permitido'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 64
('Meus convidados podem subir na laje?',
'Não. É proibido subir em muros, lajes, gradis ou qualquer estrutura do condomínio. Isso gera risco de acidente e você será multado.',
'area_lazer_festas',
ARRAY['proibicao', 'seguranca', 'laje'],
ARRAY['laje', 'muro', 'subir', 'proibido', 'perigo'],
'Artigo 17º',
'warning',
'urgent',
2,
ARRAY['Pode subir no teto?', 'Acessar laje', 'Proibido escalar'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 65
('Alguém quebrou vidro na minha festa',
'Limpe imediatamente com MUITO cuidado. Descarte em jornal ou papelão, identifique "VIDRO QUEBRADO" e leve direto ao lixo. Avise o zelador para limpeza final e verificação.',
'area_lazer_festas',
ARRAY['acidente', 'vidro', 'limpeza'],
ARRAY['quebrou', 'vidro', 'estilhaço', 'caco', 'corte'],
'Artigos 27º e 69º',
'emergency',
'urgent',
1,
ARRAY['Vidro quebrado na festa', 'Acidente com garrafa', 'Como limpar vidro'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
true);

-- ============================================================================
-- CONTINUAÇÃO: CATEGORIA 3: ÁREA DE LAZER - ESPORTES (25 FAQs)
-- ============================================================================

INSERT INTO public.faqs (question, answer, category, tags, keywords, article_reference, scenario_type, tone, priority, question_variations, condominio_id) VALUES

-- Pergunta 66
('Qual o horário de funcionamento do campo de esportes?',
'O campo pode ser usado durante o dia. A iluminação funciona das 18h às 22h (até 23h em julho, dezembro e janeiro). Respeite o horário de silêncio.',
'area_lazer_esportes',
ARRAY['campo', 'horario', 'iluminacao'],
ARRAY['campo', 'futebol', 'horario', 'iluminacao', 'luz'],
'Artigo 33º',
'simple',
'friendly',
2,
ARRAY['Horário do campo iluminado?', 'Até quando posso jogar bola?', 'Campo tem luz?'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 67
('Posso jogar bola com amigos?',
'Sim. Para uso informal com até 4 convidados, não precisa reservar. Para jogos organizados, apresente lista de jogadores com 2h de antecedência na portaria.',
'area_lazer_esportes',
ARRAY['futebol', 'amigos', 'informal'],
ARRAY['jogar', 'bola', 'futebol', 'amigos', 'racha'],
'Artigos 33º §4º e §5º',
'simple',
'friendly',
2,
ARRAY['Racha de bola', 'Futebol com amigos', 'Pelada no campo'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 68
('Posso fazer pelada semanal com pessoal de fora?',
'Não. É VEDADA a reserva do campo para jogos periódicos com pessoas externas ao condomínio. Limite de 4 convidados para uso informal.',
'area_lazer_esportes',
ARRAY['pelada', 'proibicao', 'externo'],
ARRAY['pelada', 'semanal', 'externo', 'todo sabado', 'proibido'],
'Artigo 33º - Parágrafo 3º e 4º',
'warning',
'formal',
1,
ARRAY['Futebol toda semana', 'Pelada de sábado', 'Time de fora do condomínio'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 69
('Posso jogar vôlei na quadra?',
'Sim, o espaço é multiuso. Respeite o revezamento com outros moradores que queiram usar.',
'area_lazer_esportes',
ARRAY['volei', 'quadra', 'esporte'],
ARRAY['volei', 'quadra', 'esporte', 'multiuso', 'rede'],
'Artigo 16º',
'simple',
'friendly',
3,
ARRAY['Tem quadra de vôlei?', 'Pode jogar vôlei?', 'Campo serve para vôlei'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 70
('O campo não pode ser usado, por quê?',
'O campo pode estar interditado por: manutenção programada (grama, rede, iluminação), área reservada, ou problemas estruturais. Verifique avisos na portaria.',
'area_lazer_esportes',
ARRAY['interdicao', 'manutencao', 'fechado'],
ARRAY['interditado', 'fechado', 'manutencao', 'grama', 'problema'],
'Artigo 33º - Parágrafo 2º',
'simple',
'friendly',
3,
ARRAY['Campo está fechado', 'Por que não posso usar?', 'Campo interditado'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 71
('Posso jogar descalço?',
'Não é recomendado por segurança (pregos, vidro, objetos cortantes). Use calçado apropriado para esporte.',
'area_lazer_esportes',
ARRAY['seguranca', 'calcado', 'recomendacao'],
ARRAY['descalco', 'pe nu', 'chuteira', 'sapato', 'seguranca'],
'Artigo 43º (segurança)',
'educational',
'friendly',
4,
ARRAY['Pode jogar sem sapato?', 'Precisa usar tênis?', 'Pé descalço no campo'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 72
('Criança pode jogar sozinha?',
'Crianças menores devem estar acompanhadas de um adulto responsável. Adolescentes podem usar com supervisão à distância. Responsabilidade é sempre dos pais.',
'area_lazer_esportes',
ARRAY['crianca', 'supervisao', 'seguranca'],
ARRAY['crianca', 'filho', 'menor', 'sozinho', 'supervisao'],
'Artigo 66º',
'simple',
'friendly',
2,
ARRAY['Filho pode jogar sem mim?', 'Menor sozinho no campo', 'Supervisão de criança'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 73
('Cachorro pode correr no campo?',
'Não. Animais são proibidos na área de lazer (campo, quadra, playground). Use a área pet específica.',
'area_lazer_esportes',
ARRAY['cachorro', 'animal', 'proibicao'],
ARRAY['cachorro', 'pet', 'correr', 'campo', 'proibido'],
'Artigo 34º - Parágrafo 5º',
'warning',
'formal',
2,
ARRAY['Pet no campo de esportes', 'Cachorro na quadra', 'Animal pode brincar'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 74
('Posso fazer treino de corrida no campo?',
'Sim, desde que não atrapalhe quem está jogando. Priorize horários de menor movimento.',
'area_lazer_esportes',
ARRAY['corrida', 'treino', 'uso'],
ARRAY['corrida', 'correr', 'treino', 'caminhada', 'cooper'],
'Artigo 16º',
'simple',
'friendly',
3,
ARRAY['Correr no campo', 'Cooper na quadra', 'Caminhada no espaço'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 75
('A grama está alta',
'Abra ocorrência no app ou informe ao síndico. A manutenção da grama é responsabilidade do zelador, mas depende de cronograma.',
'area_lazer_esportes',
ARRAY['manutencao', 'grama', 'reclamacao'],
ARRAY['grama', 'alta', 'cortar', 'manutencao', 'zelador'],
'Artigo 63º',
'procedural',
'friendly',
3,
ARRAY['Grama precisa cortar', 'Campo mal cuidado', 'Reclamar da grama'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 76
('Posso fazer aula de futebol particular?',
'Não. Atividades profissionais e comerciais são proibidas nas áreas comuns.',
'area_lazer_esportes',
ARRAY['aula', 'proibicao', 'comercial'],
ARRAY['aula', 'professor', 'particular', 'comercial', 'escolinha'],
'Artigo 47º',
'warning',
'formal',
2,
ARRAY['Escolinha de futebol', 'Professor particular no campo', 'Treino profissional'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 77
('Alguém quebrou a rede do gol',
'Comunique imediatamente ao síndico. Identifique o responsável se possível. Danos ao patrimônio devem ser ressarcidos por quem causou.',
'area_lazer_esportes',
ARRAY['dano', 'patrimonio', 'responsabilidade'],
ARRAY['quebrou', 'rede', 'gol', 'dano', 'vandalismo'],
'Artigos 43º e 69º',
'procedural',
'formal',
2,
ARRAY['Rede do gol rasgada', 'Quebrou equipamento', 'Vandalismo no campo'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 78
('Posso jogar basquete?',
'Verifique se há tabela de basquete disponível. Caso não haja, pode sugerir a instalação em assembleia.',
'area_lazer_esportes',
ARRAY['basquete', 'equipamento', 'sugestao'],
ARRAY['basquete', 'cesta', 'tabela', 'quadra', 'jogo'],
'Artigo 63º',
'simple',
'friendly',
4,
ARRAY['Tem cesta de basquete?', 'Pode jogar basquete?', 'Quadra poliesportiva'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 79
('Queimado pode jogar no campo?',
'Sim, é uso livre. Esportes recreativos são permitidos desde que não danifiquem o espaço.',
'area_lazer_esportes',
ARRAY['queimado', 'recreacao', 'permitido'],
ARRAY['queimado', 'brincadeira', 'jogo', 'bola', 'crianca'],
'Artigo 16º',
'simple',
'friendly',
4,
ARRAY['Brincar de queimado', 'Jogos recreativos', 'Esportes infantis'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 80
('Música alta durante o jogo, pode?',
'Não. Som deve respeitar as regras gerais do condomínio: volume moderado sempre, e silêncio após 22h (23h em julho/dez/jan).',
'area_lazer_esportes',
ARRAY['som', 'musica', 'barulho'],
ARRAY['som', 'musica', 'caixa', 'barulho', 'volume'],
'Artigos 1º e 2º',
'warning',
'formal',
2,
ARRAY['Som no campo', 'Música enquanto joga', 'Barulho na quadra'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 81
('Bola foi para fora do condomínio',
'Comunique à portaria. Dependendo da localização, o porteiro pode auxiliar na recuperação. Não pule o muro ou entre em propriedade alheia sem autorização.',
'area_lazer_esportes',
ARRAY['bola', 'problema', 'procedimento'],
ARRAY['bola', 'fora', 'perdeu', 'vizinho', 'muro'],
'Artigo 17º',
'procedural',
'friendly',
3,
ARRAY['Perdi a bola', 'Bola caiu no vizinho', 'Como recuperar bola'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 82
('Queimou a lâmpada do refletor',
'Abra ocorrência para o zelador trocar. Manutenção elétrica é responsabilidade do condomínio.',
'area_lazer_esportes',
ARRAY['manutencao', 'iluminacao', 'problema'],
ARRAY['lampada', 'refletor', 'luz', 'queimou', 'escuro'],
'Artigo 63º',
'procedural',
'friendly',
3,
ARRAY['Luz queimada no campo', 'Refletor não funciona', 'Campo escuro'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 83
('Posso fazer campeonato entre moradores?',
'Sim, organize com antecedência. Informe ao síndico sobre datas e participantes. Campeonatos internos são incentivados.',
'area_lazer_esportes',
ARRAY['campeonato', 'evento', 'organizacao'],
ARRAY['campeonato', 'torneio', 'copa', 'competicao', 'moradores'],
'Artigo 63º',
'procedural',
'friendly',
3,
ARRAY['Torneio de futebol', 'Copa entre vizinhos', 'Competição interna'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 84
('Tem marcação na quadra?',
'Verifique as condições atuais da quadra. Se as linhas estiverem apagadas, pode sugerir repintura em assembleia.',
'area_lazer_esportes',
ARRAY['quadra', 'marcacao', 'pintura'],
ARRAY['marcacao', 'linha', 'pintura', 'quadra', 'campo'],
'Artigo 63º',
'simple',
'friendly',
4,
ARRAY['Linhas do campo', 'Precisa pintar', 'Marcação apagada'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 85
('Posso usar o campo para empinar pipa?',
'Sim, mas com cuidado para não atingir a iluminação/fiação. Cerol é CRIME e proibido. Não suba em estruturas.',
'area_lazer_esportes',
ARRAY['pipa', 'cerol', 'seguranca'],
ARRAY['pipa', 'papagaio', 'cerol', 'empinar', 'crime'],
'Artigos 17º e Lei Federal 7.802/1989',
'warning',
'formal',
2,
ARRAY['Soltar pipa', 'Empinar papagaio', 'Cerol é permitido'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 86
('Bola bateu no carro de alguém',
'Você é responsável por danos causados durante o jogo. Identifique-se, se desculpe e arque com o conserto se houver dano.',
'area_lazer_esportes',
ARRAY['dano', 'responsabilidade', 'carro'],
ARRAY['bola', 'carro', 'dano', 'amassou', 'responsavel'],
'Artigo 43º',
'conflict',
'formal',
1,
ARRAY['Bola amassou carro', 'Acertei veículo', 'Quem paga o conserto'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 87
('Galera jogando bola está xingando muito',
'Comunique ao síndico ou registre no livro de ocorrências. Comportamento que fira a moral ou perturbe os demais é passível de advertência.',
'area_lazer_esportes',
ARRAY['comportamento', 'xingamento', 'denuncia'],
ARRAY['xingamento', 'palavrao', 'comportamento', 'baixaria', 'denuncia'],
'Artigos 19º e 65º',
'conflict',
'formal',
2,
ARRAY['Muito palavrão no campo', 'Comportamento inadequado', 'Jogadores xingando'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 88
('Posso fazer crossfit no campo?',
'Sim, desde que não danifique a grama/estrutura e não impeça o uso pelos demais. Evite equipamentos pesados que marquem o piso.',
'area_lazer_esportes',
ARRAY['crossfit', 'treino', 'uso'],
ARRAY['crossfit', 'treino', 'academia', 'exercicio', 'fisico'],
'Artigos 16º e 43º',
'simple',
'friendly',
3,
ARRAY['Treino funcional no campo', 'Academia ao ar livre', 'Exercícios no espaço'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 89
('Idoso pode usar o campo para caminhada?',
'Sim, é incentivado. O espaço é multigeracional. Apenas respeite quem estiver jogando.',
'area_lazer_esportes',
ARRAY['idoso', 'caminhada', 'inclusao'],
ARRAY['idoso', 'terceira idade', 'caminhada', 'saude', 'exercicio'],
'Artigo 16º',
'simple',
'friendly',
3,
ARRAY['Vovô pode caminhar no campo', 'Idoso no espaço', 'Terceira idade'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 90
('Quero sugerir cobertura para a quadra',
'Envie sugestão por escrito ao síndico ou apresente em assembleia. Melhorias com custo dependem de aprovação dos condôminos.',
'area_lazer_esportes',
ARRAY['sugestao', 'melhoria', 'cobertura'],
ARRAY['cobertura', 'teto', 'sombra', 'sugestao', 'melhoria'],
'Artigos 63º e 85º',
'procedural',
'friendly',
4,
ARRAY['Cobrir a quadra', 'Fazer teto no campo', 'Sugestão de reforma'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96');

-- ============================================================================
-- CATEGORIA 4: ANIMAIS - PASSEIO (20 FAQs)
-- ============================================================================

-- Vou continuar com as demais categorias... Posso gerar as próximas 210 FAQs?

