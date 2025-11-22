import { createClient } from '@supabase/supabase-js'
import { pipeline } from '@xenova/transformers'
import * as dotenv from 'dotenv'

// Carrega variáveis do arquivo .env
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Faltam variáveis no arquivo .env')
  console.error('Verifique se SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidos.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Base de Conhecimento Estendida - Pinheiro Park
// Baseado na Convenção e Regimento Interno
const documents = [
  // --- 1. SILÊNCIO E BARULHO ---
  { title: "Horário de Silêncio (Padrão)", content: "O horário de silêncio obrigatório é das 22h00 às 06h00. (Regimento, Art. 1º)" },
  { title: "Horário de Silêncio (Férias)", content: "Nos meses de Julho, Dezembro e Janeiro, o silêncio começa um pouco mais tarde, às 23h00, indo até às 08h00. (Regimento, Art. 1º Parágrafo Único)" },
  { title: "Barulho durante o dia", content: "Mesmo fora do horário de silêncio, o uso de som, instrumentos musicais ou qualquer ruído não deve perturbar o sossego dos vizinhos. (Regimento, Art. 2º)" },
  { title: "Som automotivo", content: "É proibido testar sistema de sonorização de veículos dentro do condomínio. (Regimento, Art. 14º)" },
  { title: "Gritos e Algazarras", content: "Os moradores devem evitar gritos e algazarras que perturbem a vizinhança, mantendo o decoro. (Convenção, Cap IV)" },

  // --- 2. LIXO E LIMPEZA ---
  { title: "Horário Coleta de Lixo (Manhã)", content: "A coleta de lixo é feita pelo zelador pela manhã das 07:30h às 08:30h. (Regimento, Art. 3º)" },
  { title: "Horário Coleta de Lixo (Tarde)", content: "A coleta de lixo é feita pelo zelador à tarde das 15:30h às 16:00h. (Regimento, Art. 3º)" },
  { title: "Lixo aos Domingos", content: "Não há coleta de lixo aos domingos e feriados. O morador deve guardar o lixo em sua unidade. (Regimento, Art. 3º)" },
  { title: "Onde colocar o lixo", content: "O lixo deve ser colocado na frente das unidades apenas nos horários estipulados de coleta. (Regimento, Art. 3º)" },
  { title: "Lixo fora do horário", content: "Nos dias de folga do zelador ou fora do horário, o lixo deve ser bem acondicionado dentro da própria casa para evitar mau cheiro e insetos. (Regimento, Art. 3º)" },
  { title: "Entulhos de Obra", content: "Restos de construção e entulhos não são recolhidos pelo condomínio. Devem ser removidos imediatamente pelo morador. (Regimento, Art. 39º)" },
  { title: "Lixo nas áreas comuns", content: "É proibido jogar lixo, papéis ou pontas de cigarro nas áreas comuns, ruas ou pelas janelas. (Regimento, Art. 51º)" },
  { title: "Móveis velhos", content: "A destinação de móveis, eletrodomésticos velhos ou objetos grandes é responsabilidade do morador, sendo proibido colocar no lixo comum. (Regimento, Art. 50º)" },

  // --- 3. ÁREAS DE LAZER (GERAL) ---
  { title: "Horário Geral Lazer", content: "A área de lazer (piscina, quadra, playground) funciona das 06h00 às 23h00. É vedado o uso fora deste horário. (Regimento, Art. 4º)" },
  { title: "Reserva para festas", content: "Para festas, é necessário fazer reserva com antecedência de 05 dias. (Regimento, Art. 22º)" },
  { title: "Quem pode reservar", content: "Apenas moradores podem reservar a área de lazer. É proibido reservar para terceiros ou sublocar. (Regimento, Art. 21º)" },
  { title: "Finalidade da Reserva", content: "As reservas são apenas para fins sociais e familiares. É proibido uso político, religioso ou comercial. (Regimento, Art. 21º)" },
  { title: "Limpeza pós-festa", content: "O morador é responsável por entregar o espaço limpo e organizado imediatamente após o uso. (Comunicado Oficial e Regimento)" },
  { title: "Danos na área de lazer", content: "O condômino responsável pela reserva arcará com qualquer dano causado ao patrimônio durante o evento. (Regimento, Art. 23º)" },
  { title: "Animais no Lazer", content: "É terminantemente proibida a presença de animais no salão de festas, quadra, piscina e playground. (Regimento, Art. 34º)" },

  // --- 4. SALÃO DE FESTAS ---
  { title: "Horário Limite Festas", content: "O uso do salão de festas é permitido até 01h00 da manhã. (Regimento, Art. 5º)" },
  { title: "Som em Festas", content: "O uso de som ou instrumentos musicais em festas é permitido até 01h00, desde que não perturbe o sossego. (Regimento, Art. 5º)" },
  { title: "Taxa de Reserva", content: "É cobrada uma taxa de 30% do valor do condomínio para cobrir despesas de limpeza/manutenção do salão. (Regimento, Art. 23º)" },
  { title: "Limite de Convidados (Salão)", content: "O limite máximo para festas no salão é de 100 convidados. (Regimento, Art. 21º)" },
  { title: "Segurança em Festas", content: "Se a festa tiver mais de 50 convidados, o morador é obrigado a contratar um segurança particular. (Regimento, Art. 21º)" },
  { title: "Lista de Convidados", content: "É obrigatório entregar a lista de convidados na portaria com 4 horas de antecedência. (Regimento, Art. 21º)" },
  { title: "Desistência de Reserva", content: "O cancelamento da reserva deve ser feito com até 48 horas de antecedência. (Regimento, Art. 24º)" },
  { title: "Carros de Convidados", content: "Não é permitida a entrada de carros de convidados dentro do condomínio em dias de festa. (Regimento, Art. 21º)" },

  // --- 5. PISCINA ---
  { title: "Quem pode usar a piscina", content: "A piscina é de uso exclusivo dos moradores e seus convidados limitados. (Regimento, Art. 28º)" },
  { title: "Limite de Convidados Piscina", content: "Cada unidade pode levar no máximo 04 (quatro) convidados para a piscina. (Regimento, Art. 28º)" },
  { title: "Empregados na Piscina", content: "Não é permitido o uso da piscina por empregados domésticos ou do condomínio. (Regimento, Art. 28º)" },
  { title: "Trajes de Banho", content: "É proibido entrar na piscina usando trajes de tecido inadequado como jeans. (Regimento, Art. 30º)" },
  { title: "Alimentos na Piscina", content: "É proibido comer ou beber na borda ou dentro da piscina. Utilize as mesas. (Regimento, Art. 30º)" },
  { title: "Vidro na Piscina", content: "É proibido levar garrafas ou copos de vidro para a área da piscina para evitar acidentes. (Regimento, Art. 30º)" },
  { title: "Bronzeador", content: "É proibido o uso de óleos bronzeadores na piscina. Apenas protetor solar é permitido. (Regimento, Art. 30º)" },
  { title: "Fumar na Piscina", content: "É proibido fumar na área da piscina ou jogar bitucas no chão/água. (Regimento, Art. 30º)" },
  { title: "Exame Médico", content: "É condição indispensável para uso da piscina estar em gozo de perfeita saúde. (Regimento, Art. 31º)" },
  { title: "Crianças na Piscina", content: "Crianças devem estar sempre acompanhadas pelos pais ou responsáveis. O condomínio não tem salva-vidas. (Regimento, Art. 29º)" },

  // --- 6. CAMPO DE FUTEBOL / QUADRA ---
  { title: "Horário Iluminação Campo", content: "A iluminação do campo pode ser ligada das 18h00 às 22h00. (Regimento, Art. 33º)" },
  { title: "Horário Campo (Férias)", content: "Em Julho, Dezembro e Janeiro, a iluminação do campo pode ir até às 23h00. (Regimento, Art. 33º)" },
  { title: "Reserva de Campo", content: "É proibido reservar o campo para jogos semanais fixos com pessoas de fora. Prioridade é dos moradores. (Regimento, Art. 33º)" },
  { title: "Convidados no Campo", content: "Para jogos informais, o limite é de 4 convidados externos. (Regimento, Art. 33º)" },
  { title: "Lista de Jogadores", content: "Para jogos com convidados, a lista deve ser entregue na portaria com 2 horas de antecedência. (Regimento, Art. 33º)" },
  { title: "Subir no Muro/Grade", content: "É proibido subir nos muros ou grades de proteção do campo de esportes. (Regimento, Art. 17º)" },

  // --- 7. ANIMAIS DE ESTIMAÇÃO (PETS) ---
  { title: "Quantidade de Animais", content: "É permitido ter até 02 (dois) animais de estimação por casa. (Regimento, Art. 34º)" },
  { title: "Animais Grandes", content: "É proibida a criação de animais de grande porte no condomínio. (Regimento, Art. 34º)" },
  { title: "Animais Agressivos", content: "Animais de médio porte ou agressivos devem usar focinheira. (Regimento, Art. 34º)" },
  { title: "Passeio com Pets", content: "Os animais só podem circular nas áreas comuns com coleira e acompanhados por responsável. (Regimento, Art. 34º)" },
  { title: "Área Pet", content: "O condomínio possui uma Área Pet para recreação, que funciona das 06h00 às 00h00. (Regimento, Art. 34º)" },
  { title: "Dejetos de Animais", content: "O dono é obrigado a recolher imediatamente as fezes do seu animal nas áreas comuns. (Regimento, Art. 34º)" },
  { title: "Pets no Lazer", content: "Animais são proibidos na piscina, salão de festas, quadra e playground. (Regimento, Art. 34º)" },
  { title: "Barulho de Animais", content: "Animais que latem excessivamente ou causam incômodo constante podem ser proibidos. (Regimento, Art. 34º)" },

  // --- 8. MUDANÇAS ---
  { title: "Dias de Mudança", content: "Mudanças são permitidas de Segunda a Sábado. Proibido em domingos e feriados. (Regimento, Art. 44º)" },
  { title: "Horário Mudança (Semana)", content: "De segunda a sexta, mudanças podem ocorrer das 08h00 às 12h00 e das 14h00 às 18h00. (Regimento, Art. 44º)" },
  { title: "Horário Mudança (Sábado)", content: "Aos sábados, mudanças são permitidas apenas das 08h00 às 12h00. (Regimento, Art. 44º)" },
  { title: "Documentos para Mudança", content: "Para mudar, é preciso apresentar na portaria cópia do contrato de locação ou documento de compra. (Regimento, Art. 44º)" },
  { title: "Aviso de Mudança", content: "A mudança deve ser agendada ou comunicada previamente à administração. (Prática comum)" },

  // --- 9. OBRAS E REFORMAS ---
  { title: "Dias de Obra", content: "Obras são permitidas de Segunda a Sábado. Proibido em domingos e feriados. (Regimento, Art. 44º)" },
  { title: "Horário Obra (Semana)", content: "De segunda a sexta, obras das 08h00 às 12h00 e das 14h00 às 18h00. (Regimento, Art. 44º)" },
  { title: "Horário Obra (Sábado)", content: "Aos sábados, obras apenas das 08h00 às 12h00. (Regimento, Art. 44º)" },
  { title: "Entulho de Obra", content: "O entulho não pode ser deixado na calçada ou rua. Deve ser removido via caçamba contratada pelo morador. (Regimento, Art. 39º)" },
  { title: "Alteração de Fachada", content: "Reformas não podem comprometer a estrutura nem alterar a estética da fachada sem aprovação. (Convenção, Art. 8º)" },
  { title: "Aviso de Obra", content: "Toda obra deve ser comunicada previamente ao síndico/administração. (Regimento, Art. 54º)" },

  // --- 10. GARAGEM E VEÍCULOS ---
  { title: "Velocidade Máxima", content: "A velocidade máxima permitida dentro do condomínio é de 10 km/h. (Regimento, Art. 13º)" },
  { title: "Estacionamento na Rua", content: "É proibido estacionar veículos nas ruas internas ou calçadas. Use a garagem. (Regimento, Art. 15º)" },
  { title: "Vaga de Visitante", content: "Visitantes devem estacionar na garagem da unidade visitada (se couber) ou fora do condomínio. (Regimento, Art. 12º)" },
  { title: "Conserto de Carros", content: "É proibido fazer mecânica ou lanternagem nas áreas comuns ou garagem. Apenas reparos de emergência (pneu, bateria). (Regimento, Art. 11º)" },
  { title: "Vazamento de Óleo", content: "Carros com vazamento de óleo não podem entrar ou permanecer no condomínio. A limpeza da mancha é dever do morador. (Regimento, Art. 11º)" },
  { title: "Buzina", content: "É proibido buzinar para chamar alguém ou abrir o portão. (Regimento, Art. 14º)" },
  { title: "Caminhões", content: "É proibida a entrada de veículos de grande porte, exceto mudanças (limitado a caminhão 3/4). (Regimento, Art. 58º)" },

  // --- 11. SEGURANÇA E PORTARIA ---
  { title: "Entregadores (iFood/Delivery)", content: "Por segurança, entregadores de comida, água ou gás NÃO entram no condomínio. O morador deve pegar na portaria. (Regimento, Art. 8º)" },
  { title: "Capacete", content: "Entregadores e motociclistas devem retirar o capacete ao chegar na portaria. (Regimento, Art. 8º)" },
  { title: "Identificação na Entrada", content: "Todos devem se identificar. À noite, carros com película devem baixar o vidro e acender a luz interna. (Regimento, Art. 62º)" },
  { title: "Acesso de Visitantes", content: "Nenhum visitante entra sem a autorização expressa do morador. (Regimento, Art. 81º)" },
  { title: "Chaves da Portaria", content: "As chaves das áreas comuns ficam na portaria ou com o síndico. Moradores não têm cópia. (Regimento, Art. 7º)" },
  { title: "Portão Eletrônico", content: "Em caso de perda do controle, comunicar imediatamente a administração para bloqueio. (Regimento - Segurança)" },

  // --- 12. FUNCIONÁRIOS ---
  { title: "Serviços Particulares", content: "É proibido pedir aos funcionários do condomínio para realizar serviços particulares (carregar compras, passear com cão) durante o expediente. (Regimento, Art. 45º)" },
  { title: "Ordens a Funcionários", content: "Moradores não devem dar ordens diretas aos funcionários. Reclamações ou sugestões devem ser feitas ao síndico/zelador. (Regimento, Art. 45º)" },
  { title: "Conversas na Portaria", content: "É proibido permanecer na portaria conversando com o porteiro, para não distraí-lo. (Regimento, Art. 9º)" },

  // --- 13. ADMINISTRAÇÃO ---
  { title: "Quem é o Síndico", content: "A síndica atual é Thays Ferreira dos Santos. (Edital/Comunicado)" },
  { title: "Contato da Administração", content: "O e-mail oficial é condominiopinheiropark@gmail.com. Telefone: (86) 9584-5384. (Comunicado)" },
  { title: "Livro de Ocorrências", content: "Reclamações formais devem ser feitas por escrito no Livro de Ocorrências na portaria ou via sistema. (Regimento, Art. 77º)" },
  { title: "Mandato do Síndico", content: "O síndico é eleito em assembleia para um mandato (geralmente 1 ou 2 anos, conforme Convenção). (Convenção, Art. 22º)" },
  { title: "Conselho Consultivo", content: "Composto por 3 membros efetivos e 3 suplentes, eleitos anualmente. Fiscalizam as contas. (Regimento, Art. 26º)" },

  // --- 14. FINANCEIRO ---
  { title: "Vencimento do Condomínio", content: "A taxa de condomínio vence todo dia 15 de cada mês. (Regimento, Art. 71º)" },
  { title: "Multa por Atraso", content: "Atraso no pagamento gera multa de 2% e juros de 1% ao mês. (Regimento, Art. 35º)" },
  { title: "Inadimplência e Voto", content: "Condôminos inadimplentes não podem votar em assembleias. (Convenção, Art. 13º)" },
  { title: "Fundo de Reserva", content: "É cobrada uma taxa extra de 10% (de Junho a Novembro) para compor o fundo de reserva. (Regimento, Art. 34º)" },
  { title: "Cobrança Judicial", content: "Após 60 dias de atraso, a cobrança pode ser enviada para o jurídico/judicial. (Regimento, Art. 35º)" },

  // --- 15. MULTAS E INFRAÇÕES ---
  { title: "Penalidades", content: "Infrações ao regimento sujeitam o morador a: 1) Advertência; 2) Multa. (Regimento, Art. 79º)" },
  { title: "Valor da Multa", content: "A multa corresponde a 1 (uma) taxa condominial vigente. Em caso de reincidência, pode dobrar. (Regimento, Art. 79º)" },
  { title: "Multa Direta", content: "Infrações graves que afetem a segurança ou sossego coletivo podem gerar multa direta, sem advertência prévia. (Regimento, Art. 79º)" },
  { title: "Recurso de Multa", content: "O morador tem 5 dias para recorrer de uma multa junto ao Conselho Fiscal. (Regimento, Art. 78º)" },

  // --- 16. USO DA UNIDADE ---
  { title: "Finalidade Residencial", content: "As casas são exclusivamente para uso residencial familiar. Comércio é proibido. (Regimento, Art. 47º)" },
  { title: "Repúblicas", content: "É terminantemente proibido alugar a casa para funcionamento de 'repúblicas' de estudantes ou similares. (Regimento, Art. 48º)" },
  { title: "Fachada", content: "Não é permitido alterar a cor ou forma da fachada, nem estender roupas em locais visíveis da rua. (Regimento, Art. 53º)" },
  { title: "Aluguel de Imóvel", content: "O proprietário deve fornecer cópia do Regimento ao inquilino e informar seus dados à administração. (Regimento, Art. 82º)" },

  // --- 17. VARIEDADES ---
  { title: "Bicicletas e Patins", content: "O uso de bicicletas, patins e skates é permitido nas ruas do condomínio, desde que não sejam motorizados. (Regimento, Art. 13º)" },
  { title: "Drones e Aeromodelos", content: "O uso de drones deve respeitar a privacidade dos vizinhos e as normas da ANAC. (Regra Geral de Convivência)" },
  { title: "Achados e Perdidos", content: "Objetos encontrados nas áreas comuns devem ser entregues na portaria. O condomínio não se responsabiliza por perdas. (Regimento, Art. 29º)" },
  { title: "Mudança de Titularidade", content: "Novos moradores devem atualizar o cadastro na administração imediatamente. (Regimento, Art. 67º)" },
  { title: "Dedetização", content: "O morador deve facilitar o acesso para dedetização das áreas comuns quando necessário. (Regimento, Art. 83º)" },

  // --- PERGUNTAS ESPECÍFICAS E VARIAÇÕES (Para melhorar a busca) ---
  { title: "Posso usar churrasqueira?", content: "Sim, na área de lazer, mediante reserva. É necessário limpar após o uso." },
  { title: "Tem academia?", content: "Sim, o condomínio possui academia. (Conforme tema configurado)" },
  { title: "Qual a voltagem?", content: "A voltagem padrão em Teresina é 220V. (Informação Regional)" },
  { title: "Visitante pode entrar com carro?", content: "Sim, se houver vaga na garagem da unidade visitada. Não pode estacionar na rua." },
  { title: "Uber pode entrar?", content: "Para embarque e desembarque rápido, geralmente é permitido se identificado, mas deve ser consultado na portaria." },
  { title: "Encomenda na portaria", content: "Sim, a portaria recebe encomendas. O morador deve retirar lá." },
  { title: "Internet do condomínio", content: "A internet das áreas comuns é de uso exclusivo para gestão ou conforme disponibilidade Wi-Fi visitante." },
  { title: "Posso alugar o salão para amigo?", content: "Não. A reserva deve ser feita pelo morador para uso próprio ou familiar. Sublocação é proibida." },
  { title: "Cachorro na piscina", content: "Não. Animais nunca podem entrar na área da piscina." },
  { title: "Gato no telhado", content: "O dono é responsável por manter seu animal dentro da unidade." },
  { title: "Som alto sábado", content: "Som alto é proibido se incomodar os vizinhos, independente do horário. Após 22h, silêncio total." },
  { title: "Obra no feriado", content: "Não é permitido realizar obras ou reformas em feriados e domingos." },
  { title: "Mudança no feriado", content: "Não é permitido realizar mudanças em feriados e domingos." },
  { title: "Boleto vencido", content: "Procure a administração ou o aplicativo da garantidora para atualizar o boleto com multa." },
  { title: "Multa de barulho", content: "Barulho excessivo pode gerar multa direta. O valor é de 1 cota condominial." },
  { title: "Posso plantar na calçada?", content: "Alterações no paisagismo comum dependem de aprovação do síndico/assembleia." },
  { title: "Portão quebrado", content: "Se notar defeito no portão, avise a portaria imediatamente." },
  { title: "Falta de água", content: "Verifique se é um problema da rua (Águas de Teresina) ou interno. Avise o zelador." },
  { title: "Luz queimada no poste", content: "Abra uma ocorrência no app para o zelador trocar a lâmpada." },
  { title: "Limpeza da caixa de gordura", content: "A limpeza da caixa de gordura individual é responsabilidade de cada morador." },
  { title: "Vazamento de gás", content: "Em caso de cheiro de gás, feche o registro, ventile a casa e avise a portaria." },
  { title: "Roubo ou Furto", content: "O condomínio não se responsabiliza por furtos nas áreas comuns ou dentro dos veículos." },
  { title: "Câmeras de segurança", content: "O condomínio possui câmeras nas áreas comuns para segurança." },
  { title: "Biometria Facial", content: "O acesso pode ser feito por biometria facial (se o sistema Portaria Virtual estiver ativo)." },
  { title: "Tag de acesso", content: "Tags de carro e pedestre são pessoais e intransferíveis." },
  { title: "Perdi minha chave", content: "Chame um chaveiro. A portaria não tem cópia da chave da sua casa." },
  { title: "Wi-Fi do Salão de Festas", content: "A senha do Wi-Fi do salão pode ser solicitada na portaria durante o evento." },
  { title: "Vidro na churrasqueira", content: "Cuidado com vidros na área de churrasco. Se quebrar, limpe imediatamente para ninguém se cortar." },
  { title: "Som na churrasqueira", content: "Som moderado é permitido, desde que não incomode os vizinhos próximos." },
  { title: "Pode beber na piscina?", content: "Pode beber, mas não use copos ou garrafas de vidro. Use plástico ou lata." },
  { title: "Traje de banho", content: "Use sunga, biquíni ou maiô. Short jeans ou camisetas de algodão não são permitidos na água." },
  { title: "Fralda na piscina", content: "Bebês devem usar fraldas próprias para piscina (à prova d'água)." },
  { title: "Chuveiro da piscina", content: "Tome uma ducha antes de entrar na piscina para tirar óleo e suor." },
  { title: "Posso reservar 2 dias seguidos?", content: "Depende da disponibilidade, mas a prioridade é rotativa." },
  { title: "Limpeza do salão pago", content: "A taxa de limpeza é obrigatória, mas você deve entregar o salão sem lixo espalhado." },
  { title: "Saco de lixo", content: "Use sacos resistentes e bem fechados para evitar vazamento de chorume no corredor/rua." },
  { title: "Lixo reciclável", content: "Se houver coleta seletiva, separe papel, plástico, metal e vidro." },
  { title: "Óleo de cozinha", content: "Não jogue óleo na pia. Coloque em garrafa PET e descarte no local apropriado (se houver) ou lixo orgânico bem vedado." },
  { title: "Bituca de cigarro", content: "Nunca jogue bitucas pela janela ou no chão das áreas comuns." },
  { title: "Cachorro latindo", content: "Se o cachorro late muito e incomoda, o dono será notificado." },
  { title: "Gato do vizinho", content: "Se o gato do vizinho entrar na sua casa, tente conversar amigavelmente ou registre ocorrência." },
  { title: "Posso fechar a varanda?", content: "O fechamento de varanda/terraço deve seguir o padrão aprovado em assembleia." },
  { title: "Ar condicionado", content: "A instalação de ar condicionado deve seguir o local padrão para não alterar a fachada." },
  { title: "Antena de TV", content: "Antenas devem ser instaladas em locais discretos ou pré-definidos." },
  { title: "Varal na fachada", content: "É proibido colocar varal de chão ou corda na frente da casa ou muro visível." },
  { title: "Lavagem de carro", content: "É proibido lavar carro nas ruas do condomínio (desperdício de água e sujeira)." },
  { title: "Crianças brincando na rua", content: "Motoristas devem ter atenção redobrada. Pais devem orientar crianças sobre os carros." },
  { title: "Andar de moto sem capacete", content: "As leis de trânsito (CTB) valem dentro do condomínio. Use capacete." },
  { title: "Menor dirigindo", content: "É proibido menor de idade dirigir carro ou moto dentro do condomínio." },
  { title: "Estacionar na frente da garagem", content: "Não estacione bloqueando a garagem do vizinho, nem a sua própria se invadir a rua." },
  { title: "Visitante na piscina sem mim", content: "Não. O morador deve estar presente com seus convidados na piscina." },
  { title: "Posso emprestar o salão?", content: "Não. A reserva é pessoal e intransferível." },
  { title: "Festa acabou tarde", content: "Após 01h00, a festa deve acabar e o silêncio deve ser absoluto." },
  { title: "Som automotivo na festa", content: "É proibido ligar som de carro nas áreas de lazer." },
  { title: "Taxa extra", content: "Taxas extras aprovadas em assembleia são obrigatórias para todos." },
  { title: "Prestação de contas", content: "A prestação de contas está disponível no portal da administradora e no menu Transparência do app." },
  { title: "Quando é a assembleia?", content: "Consulte o menu Comunicação para ver editais de convocação." },
  { title: "Posso votar online?", content: "Sim, se houver uma Assembleia Digital ativa no menu Votações." },
  { title: "Procuração para voto", content: "Você pode votar por procuração se o dono da unidade autorizar por escrito." },
  { title: "Inquilino pode votar?", content: "Inquilino pode votar em assuntos ordinários se o dono não estiver presente, salvo disposição contrária." },
  { title: "Síndico mora aqui?", content: "Sim, a síndica é moradora. (Thays Ferreira)" },
  { title: "Como falar com o síndico", content: "Prefira os canais oficiais (App, E-mail) ou agende um horário. Evite ir na casa dele fora de hora." },
  { title: "Zelador faz reparo?", content: "O zelador cuida das áreas comuns. Ele não pode consertar coisas dentro da sua casa." },
  { title: "Porteiro dormindo", content: "Se vir irregularidade na portaria, registre no canal de Ocorrências." },
  { title: "Segurança armada", content: "O condomínio não possui segurança armada (salvo se contratado especificamente)." },
  { title: "Cerca elétrica", content: "A cerca elétrica deve estar sempre ligada. Se notar defeito, avise." },
  { title: "Pode caminhar a noite?", content: "Sim, as áreas comuns são iluminadas para circulação." },
  { title: "Academia horário", content: "A academia (se houver) funciona geralmente das 06h às 22h/23h." },
  { title: "Personal trainer", content: "Personal trainers podem entrar cadastrados como visitantes frequentes." },
  { title: "Mudança de móveis", content: "Entrada e saída de móveis grandes contam como mudança e precisam seguir horário." },
  { title: "Elevador de mudança", content: "N/A (Condomínio de casas)." },
  { title: "Taxa de mudança", content: "Verifique se há taxa de mudança no regimento (geralmente não, mas exige agendamento)." },
  { title: "Caminhão de mudança tamanho", content: "Apenas caminhões toco ou 3/4. Carretas não entram." },
  { title: "Lixo hospitalar", content: "Seringas e agulhas devem ser descartadas em recipientes rígidos e levadas a postos de saúde." },
  { title: "Pilha e bateria", content: "Não jogue no lixo comum. Procure pontos de coleta na cidade." },
  { title: "Resto de tinta", content: "Latas de tinta devem secar antes de descartar ou ser entregues em locais apropriados." },
  { title: "Troca de pneu", content: "Pode trocar pneu furado na garagem em emergência." },
  { title: "Lavar garagem", content: "Evite desperdício de água ao lavar a garagem. Use balde." },
  { title: "Redário", content: "O uso do redário é livre para descanso." },
  { title: "Salão de jogos", content: "Crianças pequenas devem ser supervisionadas no salão de jogos." },
  { title: "Chaves perdidas", content: "Chaves achadas ficam na portaria por um tempo determinado." },
  { title: "Correspondência extraviada", content: "A portaria registra o recebimento. Verifique o livro de protocolo." },
  { title: "Posso vender coisas?", content: "Venda porta a porta é proibida. Use o grupo de classificados do condomínio (se houver)." },
  { title: "Grupo de WhatsApp", content: "O grupo oficial é apenas para comunicados. Grupos de moradores são extraoficiais." },
  { title: "Barulho de obra vizinho", content: "Se estiver no horário permitido, é tolerado. Fora do horário, reclame." },
  { title: "Cheiro de cigarro", content: "Fumar dentro de casa é permitido, mas o cheiro não deve incomodar excessivamente os vizinhos." },
  { title: "Fumar na sacada", content: "Evite jogar cinzas ou bitucas para baixo." },
  { title: "Rede de proteção", content: "Recomendado para quem tem crianças e animais (em sobrados)." },
  { title: "Cor da parede externa", content: "A cor padrão do condomínio deve ser mantida." },
  { title: "Muro alto", content: "A altura dos muros deve seguir o padrão do condomínio." },
  { title: "Calçada suja", content: "Cada morador é responsável por manter a calçada da sua frente limpa." },
  { title: "Mato no lote vizinho", content: "Se o lote é vazio, o proprietário deve limpar. Se não, o condomínio limpa e multa." },
  { title: "Dengue", content: "Não deixe água parada em vasos ou pneus. Combata a dengue." },
  { title: "Escorpião e barata", content: "Mantenha ralos fechados e dedetize sua casa regularmente." },
  { title: "Velocidade moto", content: "Motos também devem respeitar o limite de 10 km/h." },
  { title: "Estacionar na vaga de deficiente", content: "Apenas com credencial oficial e se necessário." },
  { title: "Bicicleta no corredor", content: "Não deixe bicicletas em locais de passagem comum." },
  { title: "Patins na rua", content: "Cuidado com os carros ao andar de patins." },
  { title: "Bola na parede", content: "Não chute bola nas paredes dos vizinhos ou muros comuns." },
  { title: "Drone filmando", content: "É invasão de privacidade filmar dentro da casa dos vizinhos." },
  { title: "Som na piscina", content: "Som ambiente baixo é tolerado, mas nada de caixas de som potentes." },
  { title: "Bebida alcoólica na área comum", content: "Permitido com moderação nas áreas de lazer reservadas (churrasqueira/salão)." },
  { title: "Nudez", content: "É proibido circular sem camisa ou em trajes de banho fora da área da piscina." },
  { title: "Namorar na praça", content: "Atos obscenos ou exagerados não são permitidos nas áreas comuns." },
  { title: "Discussão entre vizinhos", content: "Tente resolver amigavelmente. O síndico só intervém se afetar a coletividade." },
  { title: "Ofensa a funcionário", content: "Desacato a funcionário é infração grave e gera multa." },
  { title: "Fofoca", content: "Evite espalhar boatos que prejudiquem a harmonia do condomínio." },
  { title: "Sugestões", content: "Use o canal de sugestões no aplicativo ou livro na portaria." },
  { title: "Elogios", content: "Elogios aos funcionários são bem-vindos e registrados." }
]

async function seed() {
  console.log('🧠 Iniciando treinamento da Ísis (Base Expandida - 130+ tópicos)...')
  console.log('Aguarde, gerando inteligência localmente...')
  
  const generateEmbedding = await pipeline('feature-extraction', 'Supabase/gte-small');

  // Opcional: Limpar antes de inserir para não duplicar (Descomente se quiser resetar)
  // await supabase.from('documents').delete().neq('id', 0)

  for (const doc of documents) {
    // Feedback visual minimalista
    // process.stdout.write('.')
    
    try {
      const output = await generateEmbedding(doc.content, { pooling: 'mean', normalize: true });
      const embedding = Array.from(output.data);

      const { error } = await supabase.from('documents').insert({
        content: doc.content,
        metadata: { title: doc.title, source: 'Base de Conhecimento 2025' },
        embedding: embedding
      })

      if (error) console.error(`\n❌ Erro em "${doc.title}":`, error.message)

    } catch (e) {
      console.error(`\n❌ Falha em "${doc.title}":`, e)
    }
  }
  console.log('\n✨ Base de conhecimento atualizada com sucesso! A Ísis está mais inteligente.')
}

seed()