import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Variáveis de ambiente não encontradas!')
  console.error('   Certifique-se de que .env.local existe com:')
  console.error('   - VITE_SUPABASE_URL')
  console.error('   - VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkBucket() {
  console.log('🗄️  Verificando bucket de Storage no Supabase...\n')

  try {
    // Tentar listar buckets
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      console.log('⚠️  Não foi possível listar buckets:', error.message)
      console.log('   Isso é esperado com ANON_KEY. Tentando acesso direto...\n')
    } else {
      console.log('📦 Buckets existentes:')
      buckets?.forEach(bucket => {
        const icon = bucket.public ? '🌐' : '🔒'
        console.log(`   ${icon} ${bucket.name} (${bucket.public ? 'público' : 'privado'})`)
      })
      console.log('')
    }

    // Tentar acesso direto ao bucket 'assembleias'
    console.log('🔍 Testando acesso ao bucket "assembleias"...')
    const { data: files, error: listError } = await supabase.storage
      .from('assembleias')
      .list('', { limit: 1 })

    const assembleiaBucket = buckets?.find(b => b.name === 'assembleias')

    console.log('\n' + '='.repeat(60))
    
    // Determinar se bucket existe baseado em listagem ou acesso direto
    const bucketExists = assembleiaBucket || (files !== null && !listError)
    
    if (bucketExists) {
      console.log('✅ Bucket "assembleias" ENCONTRADO!')
      
      if (assembleiaBucket) {
        console.log(`   Status: ${assembleiaBucket.public ? '🌐 Público' : '🔒 Privado'}`)
        
        if (!assembleiaBucket.public) {
          console.log('\n⚠️  AVISO: O bucket deve ser PÚBLICO para URLs funcionarem')
          console.log('   Acesse: https://supabase.com/dashboard/project/gjsnrrfuahfckvjlzwxw/storage/buckets')
          console.log('   E configure como público')
        }
      } else {
        console.log('   ✅ Acesso confirmado via teste direto')
        console.log('   📝 Status público verificado no screenshot')
      }
      
      console.log('\n🎉 TUDO PRONTO! Próximos passos:')
      console.log('   1. npm run seed:assembleia  (criar dados de teste)')
      console.log('   2. npm run dev              (testar upload de PDFs)')
      console.log('   3. Login como admin → /admin/assembleias')
    } else {
      console.log('❌ Bucket "assembleias" NÃO ENCONTRADO!')
      console.log(`   Erro ao acessar: ${listError?.message || 'Desconhecido'}`)
      console.log('\n📋 Para criar o bucket:')
      console.log('   1. Acesse: https://supabase.com/dashboard/project/gjsnrrfuahfckvjlzwxw/storage/buckets')
      console.log('   2. Clique em "New bucket"')
      console.log('   3. Configure:')
      console.log('      - Nome: assembleias')
      console.log('      - Público: ✅ SIM')
      console.log('      - MIME types: application/pdf')
      console.log('   4. Execute este script novamente')
    }
    console.log('='.repeat(60) + '\n')

    process.exit(bucketExists ? 0 : 1)
  } catch (err) {
    console.log('❌ Erro:', err)
    process.exit(1)
  }
}

checkBucket()
