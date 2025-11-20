import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { formatDateTime } from '../lib/utils'
import PageLayout from '../components/PageLayout'
import LoadingSpinner from '../components/LoadingSpinner'

interface Activity {
  id: string
  type: 'voto' | 'ocorrencia'
  title: string
  description: string
  date: string
  status?: string
}

export default function Profile() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.id) {
      loadUserActivity()
    }
  }, [profile?.id])

  async function loadUserActivity() {
    try {
      setLoading(true)
      const userId = profile?.id

      const { data: votos } = await supabase
        .from('votos')
        .select('id, vote, voted_at, votacao:votacao_id(title)')
        .eq('user_id', userId)
        .order('voted_at', { ascending: false })
        .limit(10)

      const { data: ocorrencias } = await supabase
        .from('ocorrencias')
        .select('*')
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      const myActivities: Activity[] = []

      votos?.forEach((v: any) => {
        myActivities.push({
          id: v.id,
          type: 'voto',
          title: 'Voto Registrado',
          description: `Você participou da votação: "${v.votacao?.title}"`,
          date: v.voted_at,
          status: 'Computado'
        })
      })

      ocorrencias?.forEach((o: any) => {
        myActivities.push({
          id: o.id,
          type: 'ocorrencia',
          title: `Ocorrência: ${o.title}`,
          description: o.description,
          date: o.created_at,
          status: o.status
        })
      })

      const sorted = myActivities.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )

      setActivities(sorted)
    } catch (error) {
      console.error('Erro ao carregar atividades:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    if (confirm('Tem certeza que deseja sair?')) {
      await signOut()
      navigate('/login')
    }
  }

  if (loading) return <LoadingSpinner message="Carregando seu perfil..." />

  return (
    <PageLayout title="Meu Perfil" icon="👤" showBackButton={false}>
      
      {/* Cartão do Usuário */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 relative">
        <div className="h-24 bg-gradient-to-r from-primary to-secondary"></div>
        <div className="px-6 pb-6">
          <div className="relative flex justify-between items-end -mt-12 mb-4">
            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md">
              <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-3xl uppercase text-gray-400 font-bold">
                {profile?.full_name?.charAt(0) || '👤'}
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-red-600 text-sm font-semibold hover:bg-red-50 px-3 py-1 rounded-lg transition border border-red-200 bg-white"
            >
              Sair da Conta
            </button>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{profile?.full_name}</h2>
            <p className="text-gray-500 font-medium">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
               <span>📞 {profile?.phone || 'Não informado'}</span>
               {profile?.is_whatsapp && <span className="text-green-600 text-xs bg-green-50 px-1.5 rounded border border-green-200">WhatsApp</span>}
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-bold">Unidade</p>
                <p className="font-semibold text-gray-900">{profile?.unit_number || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-bold">Tipo</p>
                <p className="font-semibold text-gray-900 capitalize">{profile?.resident_type || 'Morador'}</p>
              </div>
            </div>
            
            <div className="mt-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-500 uppercase font-bold">Condomínio</p>
                <p className="font-semibold text-blue-900">{profile?.condominio_name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Minhas Atividades */}
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span>🕒</span> Histórico de Atividades
      </h3>

      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                item.type === 'voto' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'
              }`}>
                {item.type === 'voto' ? '🗳️' : '🚨'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                    {new Date(item.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                {item.status && (
                  <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    item.type === 'voto' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-white rounded-xl border border-gray-200 border-dashed">
            <p className="text-gray-500">Nenhuma atividade registrada recentemente.</p>
          </div>
        )}
      </div>
      
      <div className="mt-6">
          <button 
            onClick={() => navigate('/ocorrencias')}
            className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <span>🚨</span> Acessar Todas as Ocorrências
          </button>
      </div>

    </PageLayout>
  )
}