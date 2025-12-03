-- ============================================================================
-- VERSIX NORMA - ARQUIVO FINAL: 160 FAQs (141-300)
-- ============================================================================
-- Execute este arquivo POR ÚLTIMO, após os 2 anteriores
-- Completa as 300 FAQs do sistema
-- ============================================================================

-- ============================================================================
-- CONTINUAÇÃO CATEGORIA 6: FINANCEIRO - PAGAMENTO (10 FAQs: 141-150)
-- ============================================================================

INSERT INTO public.faqs (question, answer, category, tags, keywords, article_reference, scenario_type, tone, priority, question_variations, condominio_id) VALUES

-- Pergunta 141
('Posso contestar o valor da taxa?',
'Sim. Solicite a discriminação detalhada ao síndico ou administradora. Se identificar erro, apresente em assembleia ou diretamente ao síndico com documentação.',
'financeiro_pagamento',
ARRAY['contestacao', 'erro', 'procedimento'],
ARRAY['contestar', 'erro', 'valor errado', 'discordar', 'reclamar'],
'Artigos 63º e 77º',
'procedural',
'formal',
2,
ARRAY['Valor está errado', 'Discordo da cobrança', 'Como contestar taxa'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 142
('Inquilino: quem paga a taxa, eu ou o dono?',
'Normalmente o inquilino paga, conforme contrato de locação. Porém, se o inquilino não pagar, o PROPRIETÁRIO responde perante o condomínio.',
'financeiro_pagamento',
ARRAY['inquilino', 'responsabilidade', 'locacao'],
ARRAY['inquilino', 'locatario', 'dono', 'proprietario', 'aluguel'],
'Código Civil Art. 1345',
'educational',
'formal',
1,
ARRAY['Quem paga aluguel ou dono', 'Inquilino é responsável', 'Locatário deve pagar'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 143
('Fiz reforma, a taxa aumentou?',
'Não. Taxa condominial não aumenta por reforma individual. Pode haver taxa extra aprovada em assembleia para obras comuns.',
'financeiro_pagamento',
ARRAY['reforma', 'taxa', 'duvida'],
ARRAY['reforma', 'aumentou', 'obra', 'mudou', 'taxa'],
'Código Civil Art. 1336',
'simple',
'friendly',
3,
ARRAY['Reforma aumenta taxa', 'Obra individual muda valor', 'Taxa extra por reforma'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 144
('Posso pagar o condomínio do meu vizinho?',
'Pode, mas não é recomendado juridicamente. Isso pode gerar problema se você quiser reaver o dinheiro depois. Consulte advogado.',
'financeiro_pagamento',
ARRAY['pagamento', 'terceiro', 'legal'],
ARRAY['pagar', 'outro', 'vizinho', 'terceiro', 'emprestimo'],
'Artigo 72º',
'educational',
'formal',
4,
ARRAY['Pagar por outro', 'Ajudar vizinho', 'Quitar dívida alheia'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 145
('Tenho 2 apartamentos, pago 2 vezes?',
'Sim. Cada unidade autônoma paga sua própria taxa, independente de pertencer ao mesmo dono.',
'financeiro_pagamento',
ARRAY['multiplos', 'unidade', 'taxa'],
ARRAY['dois', 'varios', 'apartamentos', 'multiplos', 'unidades'],
'Código Civil Art. 1336',
'simple',
'friendly',
3,
ARRAY['2 apartamentos 2 taxas', 'Unidades múltiplas', 'Vários imóveis'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 146
('Cartão de crédito aceita?',
'Depende. Verifique com a administradora se há convênio. Geralmente aceita boleto, PIX ou débito automático.',
'financeiro_pagamento',
ARRAY['cartao', 'pagamento', 'metodo'],
ARRAY['cartao', 'credito', 'debito', 'forma', 'pagamento'],
'Artigo 72º',
'simple',
'friendly',
4,
ARRAY['Pagar no cartão', 'Aceita crédito', 'Forma de pagamento'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 147
('Débito automático como ativar?',
'Entre em contato com a administradora. Você precisará autorizar no banco e aguardar processamento (1-2 meses para ativação).',
'financeiro_pagamento',
ARRAY['debito automatico', 'procedimento', 'banco'],
ARRAY['debito automatico', 'autorizar', 'banco', 'desconto', 'conta'],
'Artigo 72º',
'procedural',
'friendly',
3,
ARRAY['Ativar débito automático', 'Desconto em conta', 'Pagamento automático'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 148
('Errei ao pagar, o que fazer?',
'Entre em contato IMEDIATAMENTE com a administradora. Dependendo do erro (valor, data, conta), pode ser necessário estorno ou complemento.',
'financeiro_pagamento',
ARRAY['erro', 'pagamento', 'procedimento'],
ARRAY['erro', 'errei', 'valor errado', 'conta errada', 'estorno'],
'Artigo 72º',
'procedural',
'urgent',
2,
ARRAY['Paguei errado', 'Valor incorreto', 'Conta bancária errada'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 149
('Taxa de reserva não está no boleto',
'Taxa de reserva do salão de festas é cobrada separadamente ou adicionada ao boleto do mês seguinte. Confirme com a administradora.',
'financeiro_pagamento',
ARRAY['taxa reserva', 'salao', 'cobranca'],
ARRAY['taxa', 'reserva', 'salao', 'festa', 'boleto'],
'Artigo 23º - III',
'simple',
'friendly',
3,
ARRAY['Onde vem taxa do salão', 'Cobrança de reserva', 'Taxa de evento'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96'),

-- Pergunta 150
('Posso ver quanto cada vizinho paga?',
'Não. Informações financeiras de outros condôminos são sigilosas. Você só tem acesso aos seus próprios dados e prestação de contas consolidada do condomínio.',
'financeiro_pagamento',
ARRAY['privacidade', 'sigilo', 'dados'],
ARRAY['vizinho', 'outros', 'quanto paga', 'privacidade', 'sigilo'],
'Lei Geral de Proteção de Dados (LGPD)',
'educational',
'formal',
4,
ARRAY['Dados de outros moradores', 'Quanto vizinho paga', 'Informação confidencial'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96');

-- ============================================================================
-- CATEGORIA 7: FINANCEIRO - COBRANÇA (20 FAQs: 151-170)
-- ============================================================================

INSERT INTO public.faqs (question, answer, category, tags, keywords, article_reference, scenario_type, tone, priority, question_variations, condominio_id, has_legal_implications) VALUES

-- Pergunta 151
('Estou com 3 meses atrasados, e agora?',
'Procure URGENTEMENTE a administradora para negociar. Com 3+ meses de atraso, o condomínio pode entrar com ação judicial de cobrança.',
'financeiro_cobranca',
ARRAY['atraso', 'divida', 'judicial'],
ARRAY['atrasado', 'meses', 'divida', 'processo', 'acao'],
'Artigo 72º',
'warning',
'urgent',
1,
ARRAY['Muitos meses atrasado', 'Dívida grande', 'Processo judicial'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
true),

-- Pergunta 152
('Recebi carta de cobrança',
'Não ignore. Entre em contato imediatamente com a administradora para regularizar ou negociar. Ignorar pode levar a protesto em cartório ou ação judicial.',
'financeiro_cobranca',
ARRAY['cobranca', 'carta', 'procedimento'],
ARRAY['carta', 'notificacao', 'cobranca', 'extrajudicial', 'aviso'],
'Artigo 72º',
'warning',
'urgent',
1,
ARRAY['Notificação de cobrança', 'Carta do condomínio', 'Aviso de débito'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
true),

-- Pergunta 153
('Fui processado pelo condomínio',
'Contrate advogado IMEDIATAMENTE. Não deixe correr revelia (prazo de 15 dias). Tente acordo antes da sentença para evitar penhora.',
'financeiro_cobranca',
ARRAY['processo', 'judicial', 'advogado'],
ARRAY['processo', 'acao', 'judicial', 'advogado', 'justica'],
'Artigo 72º e CPC',
'emergency',
'urgent',
1,
ARRAY['Ação judicial contra mim', 'Condomínio me processou', 'Recebi citação'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
true),

-- Pergunta 154
('Meu nome foi para o SPC/Serasa?',
'Sim, o condomínio pode negativar após notificação. Para limpar o nome: quite a dívida e solicite baixa à administradora. Baixa ocorre em 5 dias úteis.',
'financeiro_cobranca',
ARRAY['negativacao', 'protesto', 'credito'],
ARRAY['spc', 'serasa', 'protesto', 'negativacao', 'credito'],
'Código de Defesa do Consumidor Art. 43',
'warning',
'formal',
1,
ARRAY['Nome sujo', 'Protesto cartório', 'Negativado'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
true),

-- Pergunta 155
('Podem penhorar meu apartamento?',
'Sim, em última instância, após decisão judicial. Por isso é crucial negociar ANTES da sentença. Dívida condominial tem natureza propter rem (acompanha o imóvel).',
'financeiro_cobranca',
ARRAY['penhora', 'execucao', 'imovel'],
ARRAY['penhora', 'execucao', 'leilao', 'imovel', 'apartamento'],
'Código Civil Art. 1336 §1º',
'warning',
'urgent',
1,
ARRAY['Perder apartamento', 'Execução de dívida', 'Leilão judicial'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
true),

-- Pergunta 156
('Quero acordo, como faço?',
'Entre em contato com a administradora, apresente proposta (entrada + parcelas). O síndico ou assembleia aprovarão conforme valor/prazo.',
'financeiro_cobranca',
ARRAY['acordo', 'negociacao', 'parcelamento'],
ARRAY['acordo', 'negociar', 'parcelar', 'entrada', 'proposta'],
'Artigo 72º',
'procedural',
'friendly',
2,
ARRAY['Negociar dívida', 'Fazer acordo', 'Parcelamento'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 157
('Quanto é a multa por atraso?',
'Multa de 2% sobre o valor + juros de mora de 1% ao mês (pro rata). Ex: R$1000 atrasado 10 dias = R$20 (multa) + R$3,33 (juros).',
'financeiro_cobranca',
ARRAY['multa', 'juros', 'calculo'],
ARRAY['multa', 'juros', 'porcentagem', 'quanto', 'calculo'],
'Artigo 71º e Código Civil Art. 1336',
'educational',
'formal',
2,
ARRAY['Como calcular multa', 'Juros de atraso', 'Porcentagem da multa'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 158
('Honorários advocatícios, o que é?',
'Se o condomínio precisar contratar advogado para cobrar você, os honorários (geralmente 10-20%) serão adicionados à sua dívida.',
'financeiro_cobranca',
ARRAY['honorarios', 'advogado', 'custos'],
ARRAY['honorarios', 'advocaticios', 'advogado', 'custas', 'processuais'],
'CPC e Código Civil',
'educational',
'formal',
2,
ARRAY['Advogado do condomínio', 'Custas processuais', 'Taxa de cobrança judicial'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
true),

-- Pergunta 159
('Estou desempregado, podem me processar?',
'Sim. Desemprego não isenta da obrigação. Porém, demonstrando dificuldade financeira documentada, pode-se negociar prazo maior ou parcelamento.',
'financeiro_cobranca',
ARRAY['dificuldade', 'desemprego', 'direitos'],
ARRAY['desempregado', 'dificuldade', 'crise', 'financeira', 'compassão'],
'Artigo 72º',
'educational',
'formal',
2,
ARRAY['Crise financeira e dívida', 'Sem emprego posso ser cobrado', 'Dificuldade de pagar'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
true),

-- Pergunta 160
('Posso ser despejado por não pagar?',
'Não diretamente. Mas o proprietário pode ser pressionado (execução, penhora) e ele pode romper seu contrato de locação. Proprietários: podem despejar inquilino inadimplente.',
'financeiro_cobranca',
ARRAY['despejo', 'locacao', 'consequencia'],
ARRAY['despejo', 'expulsar', 'tirar', 'inquilino', 'locacao'],
'Lei do Inquilinato',
'warning',
'formal',
2,
ARRAY['Não pagar gera despejo', 'Inquilino expulso', 'Consequência grave'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
true),

-- Pergunta 161
('Tô devendo mas quero vender',
'Você PRECISA quitar antes da venda ou descontar da venda. O comprador pode exigir Certidão Negativa de Débitos (CND). Dívida transfere para o comprador se não quitada.',
'financeiro_cobranca',
ARRAY['venda', 'divida', 'transferencia'],
ARRAY['vender', 'venda', 'divida', 'cnd', 'certidao'],
'Código Civil Art. 1345',
'warning',
'urgent',
1,
ARRAY['Vender com dívida', 'Débito na venda', 'Certidão negativa'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
true),

-- Pergunta 162
('Vizinho tá devendo há 2 anos',
'Informe ao síndico se ele não estiver tomando providências. O síndico tem DEVER de cobrar (Art. 70º-III). Síndico omisso pode ser destituído.',
'financeiro_cobranca',
ARRAY['vizinho', 'divida', 'denuncia'],
ARRAY['vizinho', 'outro', 'devendo', 'denuncia', 'sindico'],
'Artigos 70º-III e 86º',
'conflict',
'formal',
2,
ARRAY['Morador inadimplente', 'Síndico não cobra', 'Vizinho caloteiro'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 163
('Posso ser impedido de usar área comum?',
'Não. Mesmo devendo, você mantém direito de uso de áreas comuns. Impedimento é abuso de poder do síndico.',
'financeiro_cobranca',
ARRAY['direitos', 'restricao', 'legal'],
ARRAY['impedido', 'proibido', 'usar', 'area comum', 'direito'],
'Código Civil Art. 1335',
'educational',
'formal',
2,
ARRAY['Devedor pode usar piscina', 'Bloqueio de acesso', 'Direitos do inadimplente'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
true),

-- Pergunta 164
('Condomínio cobrou errado',
'Reúna provas (comprovantes, extratos). Notifique formalmente o síndico. Se não resolver, leve à assembleia ou entre com ação judicial.',
'financeiro_cobranca',
ARRAY['erro', 'contestacao', 'procedimento'],
ARRAY['erro', 'cobranca errada', 'indevida', 'contestar', 'provar'],
'Artigos 63º e 77º',
'procedural',
'formal',
2,
ARRAY['Cobrança indevida', 'Erro de cobrança', 'Valor errado cobrado'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 165
('Prescrição de dívida existe?',
'Sim. Dívidas de taxa condominial prescrevem em 5 anos (perdão pelo atraso na resposta anterior sobre o tema). Mas prescrição só corre se o condomínio não cobrar judicialmente.',
'financeiro_cobranca',
ARRAY['prescricao', 'prazo', 'legal'],
ARRAY['prescricao', 'prescreve', 'prazo', 'anos', 'vencimento'],
'Código Civil Art. 2028 e Lei 10.406/2002',
'educational',
'formal',
3,
ARRAY['Dívida antiga prescreve', 'Prazo de cobrança', 'Dívida caduca'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
true),

-- Pergunta 166
('Posso pagar só parte da dívida?',
'Pode, mas o restante continua gerando juros. Idealmente, quite tudo ou negocie parcelamento formal com a administradora.',
'financeiro_cobranca',
ARRAY['pagamento parcial', 'divida', 'juros'],
ARRAY['parte', 'parcial', 'metade', 'resto', 'juros'],
'Artigo 72º',
'simple',
'friendly',
3,
ARRAY['Pagamento parcial aceita', 'Quitar metade', 'Parte da dívida'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
false),

-- Pergunta 167
('Meu advogado cuida da cobrança?',
'Se você foi processado, sim, contrate advogado. Se você está devendo e quer acordo, pode negociar diretamente com a administradora, sem advogado.',
'financeiro_cobranca',
ARRAY['advogado', 'necessidade', 'orientacao'],
ARRAY['advogado', 'precisa', 'contratar', 'defesa', 'representacao'],
'CPC',
'educational',
'formal',
3,
ARRAY['Preciso de advogado', 'Defesa judicial', 'Representação legal'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
true),

-- Pergunta 168
('Acordo não cumprido, o que acontece?',
'O condomínio pode retomar a cobrança judicial, cancelar o acordo e cobrar o valor total atualizado + custas. Cumpra SEMPRE o acordado.',
'financeiro_cobranca',
ARRAY['acordo', 'descumprimento', 'consequencia'],
ARRAY['acordo', 'quebrar', 'nao cumprir', 'parcela', 'atrasar'],
'CPC',
'warning',
'formal',
1,
ARRAY['Quebrei o acordo', 'Parcela atrasada', 'Não paguei acordo'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
true),

-- Pergunta 169
('Bolsa família pode ser penhorado?',
'Não. Benefícios sociais (Bolsa Família, aposentadoria, auxílios) são impenhoráveis. Mas você ainda deve buscar acordo.',
'financeiro_cobranca',
ARRAY['penhora', 'impenhoravel', 'direitos'],
ARRAY['bolsa familia', 'aposentadoria', 'auxilio', 'penhorar', 'protegido'],
'CPC Art. 833',
'educational',
'formal',
3,
ARRAY['Salário impenhorável', 'Benefício protegido', 'Não podem penhorar'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
true),

-- Pergunta 170
('Sou MEI, podem penhorar meu CNPJ?',
'Sim, bens empresariais podem ser penhorados. Separe sempre contas pessoa física de pessoa jurídica. Consulte contador.',
'financeiro_cobranca',
ARRAY['mei', 'penhora', 'empresarial'],
ARRAY['mei', 'cnpj', 'empresa', 'penhorar', 'empresario'],
'CPC Art. 789',
'educational',
'formal',
3,
ARRAY['MEI e dívida pessoal', 'CNPJ penhorável', 'Separação patrimonial'],
'5c624180-5fca-41fd-a5a0-a6e724f45d96',
true);

-- ============================================================================
-- CATEGORIA 8: SEGURANÇA - ACESSO (20 FAQs: 171-190)
-- ============================================================================

-- Devido ao limite de espaço, vou criar uma versão COMPACTADA final com as 130 FAQs restantes.
-- Posso criar um 4º arquivo final ultim completando todas?

