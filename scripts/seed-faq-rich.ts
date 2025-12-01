import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Carrega variáveis do .env manualmente
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "❌ Erro: Faltam SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Dataset FAQs Realistas para Condomínios
const faqs = [
  // FINANCEIRO
  {
    category: "Financeiro",
    question: "Quando vence o condomínio?",
    answer: "O vencimento da taxa de condomínio é dia 15 de cada mês.",
  },
  {
    category: "Financeiro",
    question: "Qual a multa por atraso?",
    answer: "Multa de 2% + juros de 1% ao mês sobre o valor em atraso.",
  },
  {
    category: "Financeiro",
    question: "Como pagar o boleto atrasado?",
    answer:
      "Entre em contato com a administração para receber boleto atualizado com multa e juros.",
  },
  {
    category: "Financeiro",
    question: "Onde vejo meu extrato?",
    answer:
      "No menu Transparência > Financeiro do aplicativo ou portal da administradora.",
  },
  {
    category: "Financeiro",
    question: "Posso negociar dívida?",
    answer:
      "Sim. Entre em contato com a administração para propor parcelamento.",
  },
  {
    category: "Financeiro",
    question: "Inquilino paga condomínio?",
    answer:
      "Sim, geralmente o inquilino arca com a taxa ordinária. Verifique o contrato de locação.",
  },

  // REGRAS GERAIS
  {
    category: "Regras",
    question: "Qual o horário de silêncio?",
    answer:
      "Das 22h às 6h nos dias úteis. No verão/férias pode ser das 23h às 8h (verifique no regimento).",
  },
  {
    category: "Regras",
    question: "Posso fazer barulho durante o dia?",
    answer: "Sim, mas sem perturbar os vizinhos. Use o bom senso.",
  },
  {
    category: "Regras",
    question: "Obra nos finais de semana?",
    answer:
      "Geralmente obras são permitidas apenas de segunda a sábado até 12h. Domingos e feriados não.",
  },
  {
    category: "Regras",
    question: "Preciso avisar quando vou fazer obra?",
    answer: "Sim, comunique previamente ao síndico ou administração.",
  },
  {
    category: "Regras",
    question: "Posso mudar a cor da fachada?",
    answer: "Não. A fachada deve seguir o padrão do condomínio.",
  },
  {
    category: "Regras",
    question: "Posso estender roupa na frente da casa?",
    answer: "Não. Use varais em áreas internas ou fundos não visíveis da rua.",
  },

  // LIXO
  {
    category: "Limpeza",
    question: "Quando é a coleta de lixo?",
    answer:
      "Manhã: 7h30 às 8h30. Tarde: 15h30 às 16h. Não há coleta domingos e feriados.",
  },
  {
    category: "Limpeza",
    question: "Onde coloco o lixo?",
    answer: "Na frente da sua casa apenas nos horários de coleta.",
  },
  {
    category: "Limpeza",
    question: "Tem coleta seletiva?",
    answer: "Verifique com a administração se há programa de reciclagem ativo.",
  },
  {
    category: "Limpeza",
    question: "O que fazer com entulho de obra?",
    answer: "Contrate caçamba particular. O condomínio não recolhe entulho.",
  },
  {
    category: "Limpeza",
    question: "Móveis velhos?",
    answer: "Responsabilidade do morador. Não deixe no lixo comum.",
  },

  // ÁREA DE LAZER
  {
    category: "Lazer",
    question: "Como reservar o salão de festas?",
    answer: "Com 5 dias de antecedência via aplicativo ou administração.",
  },
  {
    category: "Lazer",
    question: "Qual o horário limite da festa?",
    answer: "Até 1h da manhã. Após isso, silêncio total.",
  },
  {
    category: "Lazer",
    question: "Tem taxa para usar o salão?",
    answer: "Sim, geralmente 30% do valor da cota condominial.",
  },
  {
    category: "Lazer",
    question: "Quantos convidados posso levar?",
    answer:
      "Máximo de 100 convidados no salão. Acima de 50, é obrigatório contratar segurança.",
  },
  {
    category: "Lazer",
    question: "Posso alugar o salão para outra pessoa?",
    answer: "Não. A reserva é pessoal e intransferível.",
  },
  {
    category: "Lazer",
    question: "Preciso limpar após a festa?",
    answer: "Sim, deixe o espaço limpo e organizado.",
  },
  {
    category: "Lazer",
    question: "Convidados podem estacionar dentro?",
    answer: "Não. Carros de convidados devem ficar fora do condomínio.",
  },

  // PISCINA
  {
    category: "Lazer",
    question: "Qual o horário da piscina?",
    answer: "Das 6h às 23h.",
  },
  {
    category: "Lazer",
    question: "Quantos convidados posso levar na piscina?",
    answer: "Máximo de 4 convidados por unidade.",
  },
  {
    category: "Lazer",
    question: "Posso levar meu cachorro na piscina?",
    answer: "Não. Animais são proibidos na área da piscina.",
  },
  {
    category: "Lazer",
    question: "Pode levar bebida alcoólica?",
    answer: "Sim, mas sem vidro. Use copos e garrafas plásticas.",
  },
  {
    category: "Lazer",
    question: "Pode usar protetor solar na piscina?",
    answer: "Sim. Mas óleo bronzeador é proibido.",
  },
  {
    category: "Lazer",
    question: "Crianças precisam de acompanhante?",
    answer: "Sim, sempre com adulto responsável. Não há salva-vidas.",
  },
  {
    category: "Lazer",
    question: "Posso usar bermuda jeans na piscina?",
    answer: "Não. Use trajes apropriados (sunga, biquíni, maiô).",
  },

  // PETS
  {
    category: "Pets",
    question: "Quantos animais posso ter?",
    answer: "Até 2 animais de estimação por unidade.",
  },
  {
    category: "Pets",
    question: "Cachorro grande pode?",
    answer: "Não são permitidos animais de grande porte.",
  },
  {
    category: "Pets",
    question: "Preciso usar coleira?",
    answer: "Sim, sempre nas áreas comuns, e acompanhado.",
  },
  {
    category: "Pets",
    question: "Tem área pet?",
    answer: "Sim, funciona das 6h às 0h.",
  },
  {
    category: "Pets",
    question: "Devo recolher as fezes?",
    answer: "Sim, imediatamente. É obrigatório.",
  },
  {
    category: "Pets",
    question: "Meu cachorro late muito, posso ser multado?",
    answer: "Sim, se o latido incomodar os vizinhos constantemente.",
  },

  // SEGURANÇA E PORTARIA
  {
    category: "Segurança",
    question: "Entregador entra no condomínio?",
    answer: "Não. Por segurança, retire pedidos na portaria.",
  },
  {
    category: "Segurança",
    question: "Visitante precisa se identificar?",
    answer: "Sim, sempre. O morador deve autorizar a entrada.",
  },
  {
    category: "Segurança",
    question: "Tem câmeras?",
    answer: "Sim, nas áreas comuns para segurança.",
  },
  {
    category: "Segurança",
    question: "Perdi o controle do portão, o que fazer?",
    answer: "Avise imediatamente a administração para bloqueio.",
  },
  {
    category: "Segurança",
    question: "Posso emprestar minha tag?",
    answer: "Não. Tags são pessoais e intransferíveis.",
  },

  // GARAGEM E VEÍCULOS
  {
    category: "Veículos",
    question: "Qual a velocidade máxima?",
    answer: "10 km/h dentro do condomínio.",
  },
  {
    category: "Veículos",
    question: "Posso estacionar na rua?",
    answer: "Não. Use sua garagem.",
  },
  {
    category: "Veículos",
    question: "Posso consertar meu carro aqui?",
    answer: "Não. Apenas reparos emergenciais (troca de pneu).",
  },
  {
    category: "Veículos",
    question: "Meu carro está vazando óleo, e agora?",
    answer: "Limpe imediatamente e não estacione no condomínio até resolver.",
  },
  {
    category: "Veículos",
    question: "Posso lavar o carro?",
    answer: "Apenas na sua garagem, sem desperdício de água.",
  },
  {
    category: "Veículos",
    question: "Posso buzinar?",
    answer: "Não. É proibido buzinar dentro do condomínio.",
  },

  // MUDANÇAS
  {
    category: "Mudanças",
    question: "Quando posso fazer mudança?",
    answer: "Segunda a sexta: 8h-12h e 14h-18h. Sábado: 8h-12h.",
  },
  {
    category: "Mudanças",
    question: "Posso mudar no domingo?",
    answer: "Não. Domingos e feriados são proibidos.",
  },
  {
    category: "Mudanças",
    question: "Preciso avisar a mudança?",
    answer: "Sim, com antecedência para registro na portaria.",
  },
  {
    category: "Mudanças",
    question: "Tem taxa de mudança?",
    answer: "Verifique no regimento. Geralmente não, mas exige agendamento.",
  },

  // ADMINISTRAÇÃO
  {
    category: "Administração",
    question: "Como falo com o síndico?",
    answer: "Pelo app, e-mail oficial ou telefone da administração.",
  },
  {
    category: "Administração",
    question: "Quando é a assembleia?",
    answer: "Verifique convocações no menu Comunicação do app.",
  },
  {
    category: "Administração",
    question: "Posso votar online?",
    answer: "Sim, nas assembleias digitais via menu Votações.",
  },
  {
    category: "Administração",
    question: "Inquilino pode votar?",
    answer: "Depende do regimento, mas geralmente em assuntos ordinários sim.",
  },
  {
    category: "Administração",
    question: "Como abrir uma ocorrência?",
    answer: "Use o menu Suporte > Nova Ocorrência no aplicativo.",
  },
  {
    category: "Administração",
    question: "Posso ver a prestação de contas?",
    answer: "Sim, no menu Transparência > Financeiro.",
  },

  // MULTAS
  {
    category: "Multas",
    question: "Qual o valor da multa?",
    answer: "Equivalente a 1 cota condominial. Reincidência pode dobrar.",
  },
  {
    category: "Multas",
    question: "Posso recorrer da multa?",
    answer: "Sim, em até 5 dias junto ao Conselho Fiscal.",
  },
  {
    category: "Multas",
    question: "Por que fui multado?",
    answer:
      "Verifique a notificação. Pode ser por barulho, descumprimento de horários, etc.",
  },

  // DIVERSOS
  {
    category: "Diversos",
    question: "Tem Wi-Fi no condomínio?",
    answer: "Áreas comuns podem ter Wi-Fi público. Senha na portaria.",
  },
  {
    category: "Diversos",
    question: "Onde fica a chave da quadra?",
    answer: "Na portaria ou com o zelador.",
  },
  {
    category: "Diversos",
    question: "Posso plantar árvore?",
    answer: "Apenas em áreas privativas. Áreas comuns dependem de aprovação.",
  },
  {
    category: "Diversos",
    question: "Achei um objeto perdido",
    answer: "Entregue na portaria. Fica guardado por período determinado.",
  },
  {
    category: "Diversos",
    question: "Tem dedetização?",
    answer: "Sim, periodicamente nas áreas comuns. Aviso prévio é dado.",
  },
  {
    category: "Diversos",
    question: "Falta de energia",
    answer:
      "Verifique se é geral ou só sua casa. Avise o zelador se for coletiva.",
  },
  {
    category: "Diversos",
    question: "Lâmpada queimada na rua",
    answer: "Abra ocorrência no app para o zelador trocar.",
  },
  {
    category: "Diversos",
    question: "Vazamento na calçada",
    answer: "Avise imediatamente a administração.",
  },
  {
    category: "Diversos",
    question: "Como registro sugestão?",
    answer: "Use o canal de Sugestões no app ou livro na portaria.",
  },
];

async function seedFAQs() {
  console.log("📚 Iniciando seed de FAQs enriquecidas...");
  console.log(`Total: ${faqs.length} perguntas`);

  // Busca um condomínio existente para vincular (ou null se schema não exige)
  console.log("🔍 Buscando condomínio padrão...");
  const { data: condominios } = await supabase
    .from("condominios")
    .select("id")
    .limit(1);
  const condominioId = condominios?.[0]?.id || null;

  if (condominioId) {
    console.log(`✅ Usando condomínio: ${condominioId}`);
  } else {
    console.log("⚠️  Nenhum condomínio encontrado. FAQs serão globais (null).");
  }

  // Opcional: limpar FAQs antigas (descomente se quiser resetar)
  // console.log('🗑️  Limpando FAQs antigas...')
  // await supabase.from('faqs').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  let successCount = 0;
  let errorCount = 0;

  for (const faq of faqs) {
    const { error } = await supabase.from("faqs").insert({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      condominio_id: condominioId, // vincula ao condomínio encontrado
      author_id: null,
    });

    if (error) {
      console.error(`❌ Erro ao inserir: "${faq.question}"`);
      console.error(error.message);
      errorCount++;
    } else {
      successCount++;
      process.stdout.write(".");
    }
  }

  console.log(`\n✅ Seed concluído!`);
  console.log(`   Sucesso: ${successCount}`);
  console.log(`   Erros: ${errorCount}`);
  console.log(
    "\n💡 Próximo passo: executar reindexação Qdrant para vetorizar FAQs",
  );
  console.log("   Comando: npm run reindex:qdrant");
}

seedFAQs();
