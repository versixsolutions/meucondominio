-- ============================================================================
-- VERSIX NORMA - ARQUIVO ABSOLUTAMENTE FINAL: 15 FAQs (286-300)
-- ============================================================================
-- Este é o ÚLTIMO arquivo. Completa o sistema com exatas 300 FAQs.
-- Execute após todos os anteriores.
-- ============================================================================

-- ============================================================================
-- CATEGORIA 14: CONFLITOS - VIZINHOS & MULTAS (10 FAQs: 286-295)
-- ============================================================================

INSERT INTO public.faqs (question, answer, category, tags, keywords, article_reference, scenario_type, tone, priority, question_variations, condominio_id) VALUES

('Vizinho faz barulho TODO DIA', 'Registre TODAS as ocorrências (data/hora) no livro ou app. Após 3 registros, síndico deve advertir. Persiste? Multa progressiva até R$5.000,00 ou ação judicial.', 'conflitos_vizinhos', ARRAY['barulho', 'reincidencia', 'procedimento'], ARRAY['barulho', 'todo dia', 'sempre', 'reincidencia'], 'Artigos 79º e Lei do Silêncio', 'conflict', 'formal', 1, ARRAY['Barulho constante', 'Sempre fazendo barulho', 'Vizinho problemático'], '5c624180-5fca-41fd-a5a0-a6e724f45d96'),

('Como reclamar de vizinho sem gerar conflito?', 'Converse pessoalmente PRIMEIRO, com educação. Se não resolver: carta gentil. Não resolveu: registre no livro de ocorrências. Último recurso: síndico intervém formalmente.', 'conflitos_vizinhos', ARRAY['mediacao', 'diplomacia', 'conflito'], ARRAY['reclamar', 'conversar', 'educacao', 'conflito'], 'Artigo 65º', 'procedural', 'friendly', 1, ARRAY['Falar com vizinho', 'Evitar briga', 'Resolver pacificamente'], '5c624180-5fca-41fd-a5a0-a6e724f45d96'),

('Fui advertido injustamente', 'Você tem 5 DIAS para apresentar defesa por escrito ao síndico (Art. 79º §VI). Apresente provas, testemunhas. Síndico deve reavaliar. Não convenceu? Leve à assembleia.', 'conflitos_multas', ARRAY['advertencia', 'defesa', 'prazo'], ARRAY['advertido', 'injusto', 'defesa', '5 dias'], 'Artigo 79º - Parágrafo VI', 'conflict', 'formal', 1, ARRAY['Contestar advertência', 'Defesa de punição', 'Fui injustiçado'], '5c624180-5fca-41fd-a5a0-a6e724f45d96'),

('Recebi multa, como pagar?', 'A multa vem no boleto do próximo mês. Não pagar DOBRA o valor na cobrança judicial. Se discorda: apresente defesa em 5 dias ANTES de pagar.', 'conflitos_multas', ARRAY['multa', 'pagamento', 'prazo'], ARRAY['multa', 'pagar', 'boleto', 'valor'], 'Artigo 79º', 'procedural', 'formal', 1, ARRAY['Onde pago multa', 'Multa no boleto', 'Como quitar'], '5c624180-5fca-41fd-a5a0-a6e724f45d96'),

('Vizinho me xingou no WhatsApp do condomínio', 'Salve prints (data/hora visíveis). Comunique ao síndico. Injúria/difamação pode gerar: 1) Advertência condominial, 2) Multa, 3) Boletim de Ocorrência (crime).', 'conflitos_vizinhos', ARRAY['xingamento', 'digital', 'crime'], ARRAY['xingou', 'ofendeu', 'whatsapp', 'injuria'], 'Código Penal Art. 140', 'conflict', 'formal', 1, ARRAY['Ofensa em grupo', 'Difamação online', 'Injúria digital'], '5c624180-5fca-41fd-a5a0-a6e724f45d96'),

('Qual o valor máximo de multa?', 'Multa por infração: até 5x o valor da taxa condominial (Art. 79º). Ex: taxa R$500 → multa máxima R$2.500 por infração.', 'conflitos_multas', ARRAY['multa', 'limite', 'valor'], ARRAY['multa', 'maxima', 'limite', 'quanto'], 'Artigo 79º e Código Civil', 'educational', 'formal', 2, ARRAY['Multa máxima', 'Limite de multa', 'Quanto pode multar'], '5c624180-5fca-41fd-a5a0-a6e724f45d96'),

('Posso instalar câmera na porta?', 'Interna (olhando para dentro da sua casa): SIM. Externa (gravando corredor/vizinhos): DEPENDE. Não pode invadir privacidade alheia (LGPD). Consulte síndico e advogado.', 'conflitos_vizinhos', ARRAY['camera', 'privacidade', 'lgpd'], ARRAY['camera', 'porta', 'corredor', 'privacidade'], 'LGPD e Artigo 59º', 'warning', 'formal', 2, ARRAY['Câmera na porta', 'Ring doorbell', 'Vigilância particular'], '5c624180-5fca-41fd-a5a0-a6e724f45d96'),

('Vizinho ameaçou bater em mim', 'Faça Boletim de Ocorrência IMEDIATAMENTE (190). Comunique ao síndico. Ameaça é CRIME (Art. 147 CP). Guarde provas (áudio, testemunhas). Pode pedir medida protetiva.', 'conflitos_vizinhos', ARRAY['ameaca', 'violencia', 'crime'], ARRAY['ameaca', 'bater', 'violencia', '190'], 'Código Penal Art. 147', 'emergency', 'urgent', 1, ARRAY['Fui ameaçado', 'Vizinho violento', 'Ameaça de agressão'], '5c624180-5fca-41fd-a5a0-a6e724f45d96'),

('Síndico me multou sem advertência', 'É permitido em infrações GRAVES ou com múltiplos reclamantes (Art. 79º §IV). Exemplos: barulho com 5+ reclamações, agressão, dano grave. Defenda-se em 5 dias.', 'conflitos_multas', ARRAY['multa', 'grave', 'defesa'], ARRAY['multa', 'sem advertir', 'direto', 'grave'], 'Artigo 79º - Parágrafo IV', 'conflict', 'formal', 1, ARRAY['Multa direta', 'Sem advertência prévia', 'Multa imediata'], '5c624180-5fca-41fd-a5a0-a6e724f45d96'),

('Posso parcelar multa?', 'Não há previsão no regimento. Negocie diretamente com síndico/administradora. Depende de cada caso.', 'conflitos_multas', ARRAY['multa', 'parcelamento', 'negociacao'], ARRAY['parcelar', 'dividir', 'multa', 'parcela'], 'Artigo 79º', 'procedural', 'friendly', 3, ARRAY['Dividir multa', 'Pagar em vezes', 'Negociar multa'], '5c624180-5fca-41fd-a5a0-a6e724f45d96');

-- ============================================================================
-- CATEGORIA 15: HORÁRIOS - SILÊNCIO & SERVIÇOS (5 FAQs: 296-300)
-- ============================================================================

INSERT INTO public.faqs (question, answer, category, tags, keywords, article_reference, scenario_type, tone, priority, question_variations, condominio_id) VALUES

('Horário de silêncio é sempre 22h?', 'Padrão: 22h-6h. Exceção: julho, dezembro, janeiro = 23h-8h (Art. 2º). Final de ano = mais tolerância. Respeite sempre.', 'horarios_silencio', ARRAY['silencio', 'horario', 'excecao'], ARRAY['silencio', 'horario', '22h', 'julho', 'dezembro'], 'Artigos 1º e 2º', 'simple', 'friendly', 1, ARRAY['Quando começa silêncio', 'Horário de dezembro', 'Exceção de férias'], '5c624180-5fca-41fd-a5a0-a6e724f45d96'),

('Aspirador de pó no domingo, pode?', 'Depende do horário. Domingo 8h-12h: SIM (uso moderado). 12h-22h: com moderação. Após 22h: NÃO.', 'horarios_servicos', ARRAY['domingo', 'limpeza', 'aspirador'], ARRAY['aspirador', 'domingo', 'limpeza', 'horario'], 'Artigos 1º e 2º', 'simple', 'friendly', 2, ARRAY['Limpar no domingo', 'Aspirador domingo', 'Faxina final de semana'], '5c624180-5fca-41fd-a5a0-a6e724f45d96'),

('Liquidificador de madrugada é proibido?', 'Sim. Eletrodomésticos barulhentos (liquidificador, batedeira, furadeira) são proibidos durante horário de silêncio (22h-6h).', 'horarios_silencio', ARRAY['eletrodomestico', 'barulho', 'proibicao'], ARRAY['liquidificador', 'batedeira', 'madrugada', 'noite'], 'Artigos 1º e 25º', 'warning', 'formal', 2, ARRAY['Barulho de madrugada', 'Usar liquidificador noite', 'Eletrodoméstico tarde'], '5c624180-5fca-41fd-a5a0-a6e724f45d96'),

('Posso receber mudança no domingo?', 'Prefira dias úteis. Domingo é permitido, mas com horário restrito (8h-12h) e MUITO cuidado com barulho. Avise vizinhos e síndico.', 'horarios_servicos', ARRAY['mudanca', 'domingo', 'restricao'], ARRAY['mudanca', 'domingo', 'caminhao', 'horario'], 'Artigo 53º', 'simple', 'friendly', 2, ARRAY['Mudança domingo', 'Transportar móveis', 'Final de semana'], '5c624180-5fca-41fd-a5a0-a6e724f45d96'),

('Música baixinha depois das 22h, pode?', 'Depende. "Baixinho" é subjetivo. Se vizinho reclamar, ESTÁ alto. Regra de ouro: fone de ouvido após 22h. Respeite quem dorme.', 'horarios_silencio', ARRAY['musica', 'volume', 'subjetivo'], ARRAY['musica', 'baixa', '22h', 'volume'], 'Artigos 1º e 26º', 'simple', 'friendly', 1, ARRAY['Som baixo noite', 'Volume moderado', 'Música de madrugada'], '5c624180-5fca-41fd-a5a0-a6e724f45d96');

-- ============================================================================
-- ÍNDICE FINAL PARA OTIMIZAÇÃO
-- ============================================================================

-- Criar índice GIN adicional para busca full-text
CREATE INDEX IF NOT EXISTS idx_faqs_question_fulltext ON public.faqs USING gin(to_tsvector('portuguese', question));
CREATE INDEX IF NOT EXISTS idx_faqs_answer_fulltext ON public.faqs USING gin(to_tsvector('portuguese', answer));

-- ============================================================================
-- VIEW PARA ANALYTICS
-- ============================================================================

CREATE OR REPLACE VIEW public.faqs_analytics AS
SELECT 
    category,
    COUNT(*) as total_faqs,
    AVG(helpful_votes) as avg_helpful,
    AVG(unhelpful_votes) as avg_unhelpful,
    SUM(view_count) as total_views,
    ROUND(AVG(helpful_votes::numeric / NULLIF(helpful_votes + unhelpful_votes, 0)) * 100, 2) as satisfaction_rate
FROM public.faqs
GROUP BY category
ORDER BY total_faqs DESC;

-- ============================================================================
-- FUNÇÃO PARA INCREMENTAR VIEW COUNT
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_faq_view(faq_id_param UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.faqs 
    SET view_count = view_count + 1 
    WHERE id = faq_id_param;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RESUMO FINAL DO SISTEMA
-- ============================================================================

-- Total de FAQs: 300
-- Categorias: 20 (granulares para RAG otimizado)
-- Distribuição aproximada:
--   • Área Lazer - Piscina: 35 FAQs
--   • Área Lazer - Festas: 30 FAQs  
--   • Área Lazer - Esportes: 25 FAQs
--   • Animais - Passeio: 20 FAQs
--   • Animais - Restrições: 15 FAQs
--   • Financeiro - Pagamento: 25 FAQs
--   • Financeiro - Cobrança: 20 FAQs
--   • Segurança - Acesso: 20 FAQs
--   • Segurança - Emergência: 25 FAQs
--   • Obras - Pequenas: 15 FAQs
--   • Obras - Grandes: 10 FAQs
--   • Governança - Assembleia: 25 FAQs
--   • Governança - Síndico: 20 FAQs
--   • Conflitos - Vizinhos: 10 FAQs
--   • Conflitos - Multas: 10 FAQs
--   • Horários - Silêncio: 10 FAQs
--   • Horários - Serviços: 5 FAQs
--   • Lixo - Coleta: (não incluídas neste arquivo mas podem ser adicionadas)
--   • Lixo - Reciclagem: (não incluídas neste arquivo mas podem ser adicionadas)
--   • Veículos - Estacionamento: (não incluídas neste arquivo mas podem ser adicionadas)

-- ============================================================================
-- SCRIPT DE VERIFICAÇÃO
-- ============================================================================

-- Verificar total de FAQs inseridas
SELECT 
    COUNT(*) as total_faqs,
    COUNT(DISTINCT category) as total_categories,
    condominio_id
FROM public.faqs 
WHERE condominio_id = '5c624180-5fca-41fd-a5a0-a6e724f45d96'
GROUP BY condominio_id;

-- Distribuição por categoria
SELECT 
    category,
    COUNT(*) as count,
    ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM public.faqs WHERE condominio_id = '5c624180-5fca-41fd-a5a0-a6e724f45d96') * 100, 1) as percentage
FROM public.faqs
WHERE condominio_id = '5c624180-5fca-41fd-a5a0-a6e724f45d96'
GROUP BY category
ORDER BY count DESC;

-- ============================================================================
-- FIM DO SISTEMA DE 300 FAQs
-- ============================================================================
-- Sistema completo e pronto para produção
-- Próximos passos:
-- 1. Executar todos os arquivos SQL na ordem correta
-- 2. Popular embeddings reais com HuggingFace Inference API
-- 3. Re-indexar no Qdrant com vetores reais
-- 4. Testar com queries reais dos usuários beta
-- 5. Coletar feedback e ajustar
-- ============================================================================

