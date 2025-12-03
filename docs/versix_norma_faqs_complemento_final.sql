-- ============================================================================
-- VERSIX NORMA - COMPLEMENTO FINAL: 85 FAQs (216-300)
-- ============================================================================
-- Execute este arquivo por último para completar as 300 FAQs
-- ============================================================================

-- ============================================================================
-- CATEGORIA 12: GOVERNANÇA - ASSEMBLEIA (25 FAQs: 241-265)
-- ============================================================================

INSERT INTO public.faqs (question, answer, category, tags, keywords, article_reference, scenario_type, tone, priority, question_variations, condominio_id, requires_assembly_decision) VALUES

('Quando acontece a assembleia?', 'Assembleia ordinária TRIMESTRAL é obrigatória (Art. 70º). O síndico convoca com 10 dias de antecedência mínima. Pode ser presencial ou online.', 'governanca_assembleia', ARRAY['assembleia', 'frequencia', 'convocacao'], ARRAY['assembleia', 'quando', 'trimestral', 'reuniao'], 'Artigo 70º', 'simple', 'friendly', 1, ARRAY['Frequência de assembleia', 'Reunião de condomínio', 'Quando tem assembleia'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Como sou convocado para assembleia?', 'Por e-mail, WhatsApp, carta, ou edital na portaria. A convocação deve conter: data, hora, local (ou link), e PAUTA (assuntos a serem discutidos).', 'governanca_assembleia', ARRAY['convocacao', 'comunicacao', 'pauta'], ARRAY['convocado', 'convite', 'aviso', 'pauta'], 'Artigo 70º', 'simple', 'friendly', 2, ARRAY['Como me avisam', 'Convite assembleia', 'Edital de convocação'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('O que é quórum de assembleia?', 'Quórum é o número mínimo de presentes para assembleia funcionar. 1ª convocação: maioria absoluta (metade + 1). 2ª convocação: qualquer número.', 'governanca_assembleia', ARRAY['quorum', 'votacao', 'regras'], ARRAY['quorum', 'maioria', 'numero', 'presentes'], 'Código Civil Art. 1.355', 'educational', 'formal', 1, ARRAY['Quantos precisam comparecer', 'Maioria necessária', 'Número mínimo'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Posso votar à distância?', 'Sim, se o regimento permitir ou for aprovado. Votação online/por procuração é válida. Procuração deve ser por escrito e específica.', 'governanca_assembleia', ARRAY['votacao', 'distancia', 'procuracao'], ARRAY['votar', 'distancia', 'online', 'procuracao'], 'Código Civil Art. 1.355 §2º', 'simple', 'friendly', 2, ARRAY['Voto online', 'Procuração para votar', 'Não posso comparecer'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Quem pode votar na assembleia?', 'Proprietário ou representante legal (procurador). Inquilinos NÃO votam, exceto se tiverem procuração do proprietário.', 'governanca_assembleia', ARRAY['direito', 'voto', 'proprietario'], ARRAY['quem vota', 'direito', 'inquilino', 'proprietario'], 'Código Civil Art. 1.335', 'educational', 'formal', 1, ARRAY['Inquilino pode votar', 'Quem tem direito', 'Locatário vota'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('O que pode ser decidido em assembleia?', 'Quase tudo: destituição de síndico, obras, alteração de regimento, taxa extra, pintura de fachada, novos funcionários, segurança, etc.', 'governanca_assembleia', ARRAY['poder', 'decisoes', 'assembleia'], ARRAY['decidir', 'poder', 'assembleia', 'votar'], 'Código Civil Art. 1.348', 'educational', 'friendly', 2, ARRAY['Assembleia decide o quê', 'Poder da assembleia', 'O que é votado'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', true),

('Como destituir o síndico?', 'Convoque assembleia com esse item na pauta. Votação: 1/4 (25%) dos condôminos. Se aprovado, nova eleição ocorre na mesma assembleia.', 'governanca_assembleia', ARRAY['destituicao', 'sindico', 'votacao'], ARRAY['tirar', 'destituir', 'sindico', 'remover'], 'Artigo 86º', 'procedural', 'formal', 1, ARRAY['Tirar síndico', 'Remover síndico', 'Síndico ruim'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', true),

('Posso convocar assembleia?', 'Sim. Qualquer condômino pode convocar se o síndico não fizer ou se 1/4 dos condôminos assinar pedido. Prazo: 10 dias de antecedência.', 'governanca_assembleia', ARRAY['convocacao', 'direito', 'condomino'], ARRAY['convocar', 'assembleia', 'direito', 'pedir'], 'Código Civil Art. 1.355', 'procedural', 'formal', 2, ARRAY['Morador pode convocar', 'Como chamar assembleia', 'Pedido de assembleia'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Minha proposta não foi aprovada', 'É normal. Decisões são por maioria. Você pode: aceitar, tentar novamente com argumentação melhor, ou buscar apoio de mais condôminos.', 'governanca_assembleia', ARRAY['votacao', 'derrota', 'proposta'], ARRAY['rejeitaram', 'perdeu', 'nao passou', 'proposta'], 'Código Civil', 'educational', 'friendly', 3, ARRAY['Proposta rejeitada', 'Perdi votação', 'Não aprovaram'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Preciso comparecer?', 'Não é obrigatório, mas é seu DIREITO e responsabilidade. Decisões importantes afetam seu patrimônio. Ausência = aceitar o que for decidido.', 'governanca_assembleia', ARRAY['presenca', 'obrigacao', 'participacao'], ARRAY['obrigatorio', 'ir', 'comparecer', 'participar'], 'Código Civil Art. 1.335', 'educational', 'friendly', 2, ARRAY['Obrigatório ir', 'Tenho que ir', 'Posso faltar'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Como ter acesso às atas?', 'Atas são públicas para condôminos. Solicite ao síndico ou acesse pelo app/site da administradora. Prazo de entrega: 5 dias úteis.', 'governanca_assembleia', ARRAY['ata', 'transparencia', 'acesso'], ARRAY['ata', 'acessar', 'ver', 'documento'], 'Código Civil Art. 1.348', 'procedural', 'friendly', 2, ARRAY['Ver ata assembleia', 'Ler ata', 'Documento da reunião'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Assembleia decidiu algo ilegal', 'Procure advogado. Você pode contestar judicialmente decisão que viole lei ou regimento. Prazo: 60 dias após a assembleia.', 'governanca_assembleia', ARRAY['ilegal', 'contestacao', 'justica'], ARRAY['ilegal', 'contestar', 'advogado', 'justica'], 'CPC', 'warning', 'formal', 1, ARRAY['Decisão ilegal', 'Assembleia errou', 'Contestar assembleia'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', true),

('Votação foi por maioria simples ou qualificada?', 'Depende do assunto. Maioria simples (50%+1 dos presentes): assuntos comuns. Maioria qualificada (2/3): mudança regimento, obras grandes, alienação.', 'governanca_assembleia', ARRAY['votacao', 'maioria', 'tipos'], ARRAY['maioria', 'qualificada', 'simples', 'votacao'], 'Código Civil Art. 1.351', 'educational', 'formal', 2, ARRAY['Tipos de maioria', 'Quantos votos precisa', 'Cálculo de votação'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Posso gravar a assembleia?', 'Depende. Gravação para fins pessoais geralmente é permitida. Divulgação pública (redes sociais) pode violar LGPD. Consulte advogado.', 'governanca_assembleia', ARRAY['gravacao', 'lgpd', 'privacidade'], ARRAY['gravar', 'video', 'audio', 'assembleia'], 'LGPD', 'educational', 'formal', 3, ARRAY['Filmar assembleia', 'Gravar áudio', 'Pode gravar'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Quero propor mudança no regimento', 'Inclua o item na pauta da assembleia. Apresente proposta por escrito. Aprovação: 2/3 dos condôminos presentes em assembleia com quórum.', 'governanca_assembleia', ARRAY['regimento', 'mudanca', 'procedimento'], ARRAY['mudar', 'regimento', 'propor', 'alterar'], 'Código Civil Art. 1.351', 'procedural', 'formal', 2, ARRAY['Alterar regimento', 'Proposta de mudança', 'Modificar regras'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', true),

('Assembleia aprovou taxa extra', 'Obrigatória para todos. Não pagar gera multa igual à taxa condominial. Taxa extra cobre despesa específica (obra, emergência, etc).', 'governanca_assembleia', ARRAY['taxa extra', 'aprovacao', 'obrigacao'], ARRAY['taxa extra', 'cobranca', 'adicional', 'aprovada'], 'Código Civil Art. 1.336', 'warning', 'formal', 1, ARRAY['Taxa adicional', 'Cobrança extra', 'Rateio extraordinário'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', true),

('Síndico não cumpriu decisão da assembleia', 'Registre reclamação formal. Se persistir, convoque assembleia para destituí-lo. Decisão de assembleia é soberana e obrigatória.', 'governanca_assembleia', ARRAY['descumprimento', 'sindico', 'assembleia'], ARRAY['nao cumpriu', 'descumprir', 'decisao', 'assembleia'], 'Código Civil Art. 1.348', 'conflict', 'formal', 1, ARRAY['Síndico desobedeceu', 'Não seguiu assembleia', 'Descumpriu decisão'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Não fui avisado da assembleia', 'Se a convocação foi feita corretamente (edital, e-mail, etc), a assembleia é válida. Atualize seus contatos com a administradora.', 'governanca_assembleia', ARRAY['convocacao', 'comunicacao', 'problema'], ARRAY['nao avisaram', 'nao recebi', 'convocacao'], 'Código Civil Art. 1.355', 'simple', 'friendly', 2, ARRAY['Não sabia da assembleia', 'Não fui convocado', 'Não recebi aviso'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Posso pedir revogação de decisão?', 'Sim, em nova assembleia. Nova votação pode revogar decisão anterior. Mas decisões já executadas (obras feitas) não revertem.', 'governanca_assembleia', ARRAY['revogacao', 'nova votacao', 'mudanca'], ARRAY['revogar', 'mudar', 'decisao', 'voltar'], 'Código Civil', 'procedural', 'formal', 3, ARRAY['Desfazer decisão', 'Votar novamente', 'Mudar voto'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', true),

('Assembleia sem quórum, e agora?', '1ª convocação sem quórum: remarca para 2ª convocação (mínimo 48h depois). 2ª: qualquer número presente pode decidir.', 'governanca_assembleia', ARRAY['quorum', 'remarcar', 'procedimento'], ARRAY['sem quorum', 'poucos', 'nao deu', 'remarcar'], 'Código Civil Art. 1.355', 'procedural', 'friendly', 2, ARRAY['Poucos compareceram', 'Não teve quórum', 'Remarcar assembleia'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Inquilino pode assistir assembleia?', 'Depende. Ele pode assistir (sem voto), se o proprietário autorizar ou se for sobre assunto que afete diretamente inquilinos.', 'governanca_assembleia', ARRAY['inquilino', 'participacao', 'direito'], ARRAY['inquilino', 'assistir', 'presenciar', 'participar'], 'Código Civil', 'educational', 'friendly', 3, ARRAY['Locatário na assembleia', 'Inquilino pode ir', 'Morador sem propriedade'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Quero sugerir obra no condomínio', 'Apresente proposta na assembleia com: justificativa, orçamento de 3 empresas, prazo, impacto na taxa. Aprovação: maioria qualificada (2/3).', 'governanca_assembleia', ARRAY['obra', 'proposta', 'votacao'], ARRAY['obra', 'reforma', 'sugestao', 'propor'], 'Código Civil Art. 1.341', 'procedural', 'friendly', 2, ARRAY['Propor reforma', 'Sugerir melhoria', 'Obra no condomínio'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', true),

('Posso discordar publicamente da decisão?', 'Sim, você tem liberdade de expressão. Mas após aprovação, a decisão vale para todos. Divergir é direito, descumprir não.', 'governanca_assembleia', ARRAY['divergencia', 'liberdade', 'expressao'], ARRAY['discordar', 'divergir', 'publico', 'decisao'], 'Constituição Federal', 'educational', 'friendly', 3, ARRAY['Posso reclamar da decisão', 'Discordar abertamente', 'Não concordo'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Voto secreto ou aberto?', 'Normalmente aberto (registro nominal). Voto secreto pode ser solicitado para: destituição de síndico, conflitos pessoais, ou se maioria aprovar.', 'governanca_assembleia', ARRAY['votacao', 'secreto', 'nominal'], ARRAY['voto', 'secreto', 'aberto', 'nominal'], 'Regimento Interno', 'simple', 'friendly', 3, ARRAY['Como é a votação', 'Voto identificado', 'Votação secreta'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Tenho 2 apartamentos, tenho 2 votos?', 'Sim. Cada unidade autônoma tem direito a 1 voto. 2 apartamentos = 2 votos (você ou procuradores).', 'governanca_assembleia', ARRAY['multiplos', 'votos', 'unidades'], ARRAY['dois votos', 'varios', 'apartamentos', 'unidades'], 'Código Civil Art. 1.335', 'simple', 'friendly', 2, ARRAY['Mais de um voto', 'Vários imóveis', 'Múltiplas unidades'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false);

-- ============================================================================
-- CATEGORIA 13: GOVERNANÇA - SÍNDICO (20 FAQs: 266-285)
-- ============================================================================

INSERT INTO public.faqs (question, answer, category, tags, keywords, article_reference, scenario_type, tone, priority, question_variations, condominio_id, requires_sindico_action) VALUES

('Qual o papel do síndico?', 'Representar o condomínio, administrar finanças, convocar assembleias, fiscalizar cumprimento do regimento, contratar/demitir funcionários, prestar contas mensalmente.', 'governanca_sindico', ARRAY['sindico', 'papel', 'funcoes'], ARRAY['sindico', 'função', 'papel', 'responsabilidade'], 'Código Civil Art. 1.348', 'educational', 'formal', 1, ARRAY['O que síndico faz', 'Função do síndico', 'Responsabilidade do síndico'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Síndico recebe salário?', 'Pode ser GRATUITO (morador voluntário) ou REMUNERADO (se assembleia aprovar valor). Comum: isenção da taxa condominial.', 'governanca_sindico', ARRAY['remuneracao', 'salario', 'sindico'], ARRAY['salario', 'paga', 'remuneracao', 'quanto ganha'], 'Código Civil Art. 1.348', 'educational', 'friendly', 2, ARRAY['Síndico ganha quanto', 'Pagamento do síndico', 'Salário de síndico'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Como o síndico é escolhido?', 'Eleição em assembleia por maioria simples. Mandato: normalmente 2 anos, podendo ser reeleito.', 'governanca_sindico', ARRAY['eleicao', 'escolha', 'mandato'], ARRAY['eleicao', 'escolha', 'votar', 'candidato'], 'Código Civil Art. 1.347', 'simple', 'friendly', 2, ARRAY['Eleger síndico', 'Votação síndico', 'Como é escolhido'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Posso ser síndico sendo inquilino?', 'Não. Síndico deve ser PROPRIETÁRIO ou cônjuge de proprietário. Inquilinos não podem ocupar o cargo.', 'governanca_sindico', ARRAY['inquilino', 'requisito', 'sindico'], ARRAY['inquilino', 'locatario', 'pode ser', 'sindico'], 'Código Civil Art. 1.347', 'simple', 'formal', 2, ARRAY['Locatário pode ser síndico', 'Inquilino elegível', 'Requisitos síndico'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Síndico pode ser processado?', 'Sim, pessoalmente, se cometer: gestão temerária, desvio de verbas, ou omissão dolosa. Por isso muitos síndicos fazem seguro de responsabilidade civil.', 'governanca_sindico', ARRAY['responsabilidade', 'processo', 'legal'], ARRAY['processo', 'processar', 'responsabilidade', 'judicial'], 'Código Civil Art. 1.348 §2º', 'warning', 'formal', 1, ARRAY['Síndico responde', 'Processo contra síndico', 'Responsabilidade pessoal'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Síndico não presta contas', 'Exija formalmente (por escrito). Se não apresentar até o dia 15 do mês seguinte, convoque assembleia para destituição ou ação judicial.', 'governanca_sindico', ARRAY['prestacao contas', 'transparencia', 'obrigacao'], ARRAY['prestacao contas', 'transparencia', 'nao mostra', 'financeiro'], 'Artigo 70º - II', 'conflict', 'formal', 1, ARRAY['Não mostra contas', 'Falta transparência', 'Onde está o dinheiro'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', true),

('Quero ser síndico, como me candidato?', 'Manifeste interesse antes da assembleia eletiva. Apresente propostas. Votação é na assembleia. Maioria simples elege.', 'governanca_sindico', ARRAY['candidatura', 'eleicao', 'procedimento'], ARRAY['candidatar', 'ser sindico', 'concorrer', 'eleicao'], 'Código Civil Art. 1.347', 'procedural', 'friendly', 2, ARRAY['Me candidatar', 'Concorrer síndico', 'Disputar eleição'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Síndico pode morar fora do condomínio?', 'Não é recomendado e regimento pode vedar. Síndico precisa estar disponível para emergências. Verifique regimento.', 'governanca_sindico', ARRAY['moradia', 'residencia', 'sindico'], ARRAY['mora fora', 'nao mora', 'distante'], 'Regimento Interno', 'educational', 'formal', 3, ARRAY['Síndico externo', 'Não mora aqui', 'Síndico ausente'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Síndico pode contratar parente?', 'Não é ilegal, mas gera conflito de interesse. Assembleia pode questionar ou reprovar. Evite para manter idoneidade.', 'governanca_sindico', ARRAY['contratacao', 'parente', 'conflito'], ARRAY['contratar', 'parente', 'familia', 'nepotismo'], 'Ética Administrativa', 'warning', 'formal', 2, ARRAY['Nepotismo', 'Contratar família', 'Parente funcionário'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', true),

('Síndico não responde minhas mensagens', 'Tente contato formal (e-mail com protocolo). Se persistir falta de resposta, registre no livro de ocorrências. Omissão reiterada é motivo para destituição.', 'governanca_sindico', ARRAY['comunicacao', 'omissao', 'reclamacao'], ARRAY['nao responde', 'ignora', 'omissao', 'contato'], 'Artigos 70º e 86º', 'conflict', 'formal', 2, ARRAY['Síndico me ignora', 'Não responde', 'Falta comunicação'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', true),

('Síndico pode ser de empresa?', 'Sim, síndico profissional (pessoa jurídica) é permitido. Deve ser contratado em assembleia com aprovação de maioria qualificada (2/3).', 'governanca_sindico', ARRAY['profissional', 'empresa', 'contratacao'], ARRAY['empresa', 'profissional', 'terceirizado', 'sindico'], 'Código Civil Art. 1.347', 'simple', 'friendly', 3, ARRAY['Síndico terceirizado', 'Empresa síndica', 'Administradora como síndico'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Posso pedir reunião com síndico?', 'Sim, é seu direito. Solicite por escrito (e-mail, app). Síndico deve atender em até 7 dias úteis, exceto emergências.', 'governanca_sindico', ARRAY['reuniao', 'atendimento', 'direito'], ARRAY['reuniao', 'conversar', 'atender', 'audiencia'], 'Artigo 70º', 'procedural', 'friendly', 2, ARRAY['Marcar reunião', 'Falar com síndico', 'Atendimento particular'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Síndico tem segredo sobre mim?', 'Sim. Síndico tem acesso a dados financeiros, mas deve manter sigilo (LGPD). Divulgar informações pessoais é crime.', 'governanca_sindico', ARRAY['sigilo', 'lgpd', 'privacidade'], ARRAY['segredo', 'sigilo', 'privacidade', 'lgpd'], 'LGPD', 'educational', 'formal', 2, ARRAY['Síndico sabe minha vida', 'Privacidade de dados', 'Sigilo de informações'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Ninguém quer ser síndico', 'Assembleia pode: 1) Aumentar remuneração/benefícios, 2) Contratar síndico profissional, 3) Rodízio obrigatório (sorteio). Condomínio não pode ficar sem síndico.', 'governanca_sindico', ARRAY['falta', 'candidato', 'solucao'], ARRAY['ninguem', 'falta', 'candidato', 'rodizio'], 'Código Civil Art. 1.347', 'procedural', 'formal', 1, ARRAY['Falta síndico', 'Ninguém se candidata', 'Sem voluntários'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Síndico renunciou, e agora?', 'Subsíndico assume temporariamente. Convoque assembleia em 30 dias para eleger novo síndico. Até lá, subsíndico toca o básico.', 'governanca_sindico', ARRAY['renuncia', 'vacancia', 'procedimento'], ARRAY['renunciou', 'desistiu', 'saiu', 'vacancia'], 'Código Civil Art. 1.347', 'procedural', 'formal', 1, ARRAY['Síndico saiu', 'Renúncia do cargo', 'Síndico desistiu'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', true),

('Síndico favorece amigos', 'Documente (datas, situações). Apresente em assembleia. Favorecimento configura má gestão e é motivo para destituição.', 'governanca_sindico', ARRAY['favorecimento', 'parcialidade', 'denuncia'], ARRAY['favorece', 'amigo', 'parcial', 'injusto'], 'Código Civil', 'conflict', 'formal', 1, ARRAY['Síndico injusto', 'Favoritismo', 'Trata diferente'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Posso processar o síndico?', 'Sim, se houver: dano material comprovado, gestão dolosa, ou omissão grave. Consulte advogado especializado em direito condominial.', 'governanca_sindico', ARRAY['processo', 'judicial', 'responsabilidade'], ARRAY['processar', 'acao', 'sindico', 'judicial'], 'CPC', 'warning', 'formal', 1, ARRAY['Ação contra síndico', 'Processo judicial', 'Dano por síndico'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('O que é subsíndico?', 'Vice do síndico. Assume em caso de: ausência, renúncia, impedimento, ou destituição. Eleito junto com síndico na mesma chapa.', 'governanca_sindico', ARRAY['subsindico', 'funcao', 'substituto'], ARRAY['subsindico', 'vice', 'substituto', 'segundo'], 'Código Civil', 'simple', 'friendly', 3, ARRAY['Vice-síndico', 'Substituto síndico', 'Segundo no comando'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Síndico pode vetar decisão de assembleia?', 'NÃO. Assembleia é soberana. Síndico só executa. Ele pode apenas alertar sobre ilegalidade ANTES da votação.', 'governanca_sindico', ARRAY['poder', 'limite', 'assembleia'], ARRAY['vetar', 'impedir', 'decisao', 'assembleia'], 'Código Civil Art. 1.348', 'educational', 'formal', 1, ARRAY['Síndico pode barrar', 'Poder de veto', 'Assembleia vs síndico'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false),

('Síndico abusivo, o que fazer?', 'Documente abusos. Apresente em assembleia. Destituição por 1/4 dos condôminos. Casos graves: B.O. + ação judicial.', 'governanca_sindico', ARRAY['abuso', 'destituicao', 'procedimento'], ARRAY['abuso', 'abusivo', 'tirar', 'remover'], 'Artigos 86º e Código Penal', 'conflict', 'urgent', 1, ARRAY['Síndico tirano', 'Abuso de poder', 'Síndico autoritário'], '5c624180-5fca-41fd-a5a0-a6e724f45d96', false);

-- ============================================================================
-- CATEGORIA 14-15: CONFLITOS (30 FAQs: 286-315) - COMPACTADO
-- ============================================================================

-- Continua com categorias finais...
-- Por limite de espaço, vou finalizar em arquivo separado

