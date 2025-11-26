import dotenv from 'dotenv'
dotenv.config()

const QDRANT_URL = process.env.QDRANT_URL!
const QDRANT_API_KEY = process.env.QDRANT_API_KEY!
const COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME || 'norma_knowledge_base'

async function setupQdrantTextSearch() {
  console.log('🚀 Configurando Qdrant para busca por texto...\n')

  try {
    // Deletar collection antiga se existir
    console.log('🗑️ Deletando collection antiga (se existir)...')
    await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}`, {
      method: 'DELETE',
      headers: { 'api-key': QDRANT_API_KEY }
    })

    // Criar collection com suporte a texto
    console.log('📦 Criando collection com busca por texto...')
    
    const response = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}`, {
      method: 'PUT',
      headers: {
        'api-key': QDRANT_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        vectors: {}, // Sem vetores densos
        sparse_vectors: {
          text: {} // Habilita busca BM25 (texto full-text)
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Erro: ${await response.text()}`)
    }

    console.log('✅ Collection criada com sucesso!')

    // Verificar
    const infoResponse = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}`, {
      headers: { 'api-key': QDRANT_API_KEY }
    })

    if (infoResponse.ok) {
      const info = await infoResponse.json()
      console.log('\n📊 Informações da Collection:')
      console.log(`   - Nome: ${info.result.config.params.collection_name}`)
      console.log(`   - Busca por texto: ${info.result.config.params.sparse_vectors ? 'HABILITADO ✅' : 'DESABILITADO ❌'}`)
    }

    console.log('\n✅ Setup concluído! Qdrant pronto para busca por texto.')

  } catch (error: any) {
    console.error('❌ Erro:', error.message)
    process.exit(1)
  }
}

setupQdrantTextSearch()