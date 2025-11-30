import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const targetCondominioId = process.env.SEED_CONDOMINIO_ID || null

// Credenciais de teste (usuário admin)
const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@test.com'
const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'test123'

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórios no .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function loginAsAdmin() {
  console.log('🔐 Autenticando como admin...')
  const { data, error } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword
  })
  
  if (error) {
    console.error('❌ Erro ao autenticar:', error.message)
    console.error('   Verifique se o usuário existe ou configure:')
    console.error('   SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD no .env.local')
    process.exit(1)
  }
  
  console.log('✅ Autenticado como:', data.user?.email)
  return data.user
}

async function resolveCondominioId(userId: string): Promise<string> {
  if (targetCondominioId) return targetCondominioId
  
  // Buscar condomínio do usuário logado
  const { data: profile } = await supabase
    .from('users')
    .select('condominio_id')
    .eq('id', userId)
    .single()
  
  if (profile?.condominio_id) {
    return profile.condominio_id
  }
  
  // Fallback: primeiro condomínio da tabela
  const { data, error } = await supabase.from('condominios').select('id').limit(1)
  if (error || !data || data.length === 0) {
    throw new Error('Não foi possível determinar um condominio_id. Defina SEED_CONDOMINIO_ID no .env.local')
  }
  return data[0].id
}

async function run() {
  try {
    // Autentica como admin
    const user = await loginAsAdmin()
    
    // Resolve condomínio
    const condominio_id = await resolveCondominioId(user.id)
    console.log('🏢 Usando condomínio:', condominio_id)

    // cria assembleia em andamento
    console.log('📝 Criando assembleia...')
    const { data: ass, error: assErr } = await supabase
      .from('assembleias')
      .insert({
        condominio_id,
        titulo: 'Assembleia de Teste - Presença & Votação',
        data_hora: new Date().toISOString(),
        status: 'em_andamento',
        edital_topicos: ['Abertura', 'Ordem do dia', 'Encaminhamentos'],
        link_presenca: null,
      })
      .select('*')
      .single()

    if (assErr) throw assErr

    console.log('✅ Assembleia criada:', ass.id)

    // cria pautas
    console.log('🗳️  Criando pautas de votação...')
    const { error: pautaErr } = await supabase.from('assembleias_pautas').insert([
      {
        assembleia_id: ass.id,
        titulo: 'Aprovação do orçamento 2026',
        descricao: 'Deliberação sobre o orçamento anual proposto pela administração.',
        ordem: 1,
        status: 'em_votacao',
        tipo_votacao: 'aberta',
        opcoes: ['Sim', 'Não', 'Abstenção'],
      },
      {
        assembleia_id: ass.id,
        titulo: 'Troca de empresa de portaria',
        descricao: 'Proposta de troca de fornecedor atual por melhor custo/benefício.',
        ordem: 2,
        status: 'pendente',
        tipo_votacao: 'secreta',
        opcoes: ['Trocar', 'Manter'],
      }
    ])

    if (pautaErr) throw pautaErr

    console.log('✅ Pautas criadas com sucesso!')
    console.log('\n' + '='.repeat(60))
    console.log('✅ SEED CONCLUÍDO COM SUCESSO!')
    console.log('='.repeat(60))
    console.log('\n📋 Informações da assembleia:')
    console.log(`   ID: ${ass.id}`)
    console.log(`   Título: ${ass.titulo}`)
    console.log(`   Status: ${ass.status}`)
    console.log(`\n🔗 URLs para testar:`)
    console.log(`   Admin: http://localhost:5173/admin/assembleias`)
    console.log(`   Detalhes: http://localhost:5173/transparencia/assembleias/${ass.id}`)
    console.log(`   Presença: http://localhost:5173/transparencia/assembleias/${ass.id}/presenca`)
    console.log('\n🚀 Próximos passos:')
    console.log('   1. npm run dev')
    console.log('   2. Login com as credenciais de admin')
    console.log('   3. Testar os fluxos acima')
    console.log('')
  } catch (e: any) {
    console.error('\n' + '='.repeat(60))
    console.error('❌ ERRO AO CRIAR SEED')
    console.error('='.repeat(60))
    console.error('Detalhes:', e.message || e)
    
    if (e.code === '42501') {
      console.error('\n💡 Dica: Erro de RLS (Row Level Security)')
      console.error('   O usuário não tem permissão para criar assembleias.')
      console.error('   Certifique-se que:')
      console.error('   1. O usuário é admin/síndico')
      console.error('   2. As RLS policies estão configuradas')
    }
    
    console.error('')
    process.exit(1)
  }
}

run()
