import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { formatDate } from '../lib/utils'
import PageLayout from '../components/PageLayout'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

interface Votacao {
  id: string
  title: string
  description: string
  status: string // 'ativa' ou 'encerrada' (calculado via datas)
  start_date: string
  end_date: string
  created_at: string
  votes: {
    favor: number
    contra: number
    abstencao: number
    total: number
  }
  user_vote: string | null
}

export default function Votacoes() {
  const [votacoes, setVotacoes] = useState<Votacao[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    loadVotacoes()
  }, [user])

  async function loadVotacoes() {
    try {
      const { data: votacoesData, error: votacoesError } = await supabase
        .from('votacoes')
        .select('*')
        .order('end_date', { ascending: false })

      if (votacoesError) throw votacoesError

      const votacoesWithVotes = await Promise.all(
        (votacoesData || []).map(async (votacao) => {
          // Buscar votos desta votação
          const { data: votosData, error: votosError } = await supabase
            .from('votos')
            .select('vote')
            .eq('votacao_id', votacao.id)

          if (votosError) throw votosError

          // Contagem baseada no texto da coluna 'vote'
          const votes = {
            favor: votosData?.filter(v => v.vote === 'favor').length || 0,
            contra: votosData?.filter(v => v.vote === 'contra').length || 0,
            abstencao: votosData?.filter(v => v.vote === 'abstencao').length || 0,
            total: votosData?.length || 0,
          }

          // Checar se o usuário atual já votou
          let userVote = null
          if (user?.id) {
             const { data: userVoteData } = await supabase
            .from('votos')
            .select('vote')
            .eq('votacao_id', votacao.id)
            .eq('user_id', user.id)
            .maybeSingle()
            
            userVote = userVoteData?.vote || null
          }

          // Determinar status baseado na data
          const now = new Date()
          const endDate = new Date(votacao.end_date)
          const computedStatus = endDate > now ? 'ativa' : 'encerrada'

          return {
            ...votacao,
            status: computedStatus,
            votes,
            user_vote: userVote,
          }
        })
      )

      setVotacoes(votacoesWithVotes)
    } catch (error) {
      console.error('Erro ao carregar votações:', error)
    } finally {
      setLoading(false)
    }
  }

  async function votar(votacaoId: string, voto: 'favor' | 'contra' | 'abstencao') {
    try {
      const { error } = await supabase
        .from('votos')
        .insert({
          votacao_id: votacaoId,
          user_id: user?.id,
          vote: voto, // Envia string conforme novo SQL
        })

      if (error) throw error
      await loadVotacoes()
    } catch (error: any) {
      console.error('Erro ao votar:', error)
      alert(error.message || 'Erro ao registrar voto')
    }
  }

  const ativas = votacoes.filter(v => v.status === 'ativa')
  const encerradas = votacoes.filter(v => v.status === 'encerrada')

  if (loading) return <LoadingSpinner message="Carregando votações..." />

  return (
    <PageLayout
      title="Votações Online"
      subtitle="Participe das decisões do condomínio de onde estiver"
      icon="🗳️"
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-2xl md:text-3xl font-bold text-purple-600">{ativas.length}</p>
          <p className="text-xs md:text-sm text-gray-600">Ativas</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-2xl md:text-3xl font-bold text-green-600">{encerradas.length}</p>
          <p className="text-xs md:text-sm text-gray-600">Encerradas</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-2xl md:text-3xl font-bold text-blue-600">
            {votacoes.filter(v => v.user_vote).length}
          </p>
          <p className="text-xs md:text-sm text-gray-600">Você votou</p>
        </div>
      </div>

      {/* Votações Ativas */}
      {ativas.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            🔥 Votações Ativas
          </h2>
          <div className="space-y-6">
            {ativas.map((votacao) => {
              const daysLeft = Math.ceil((new Date(votacao.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

              return (
                <div key={votacao.id} className="bg-white rounded-xl shadow-lg border-2 border-purple-600 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                        🔥 VOTAÇÃO ATIVA
                      </span>
                      <span className="text-sm">
                        Termina em: <strong>{daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="p-5 md:p-6">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">{votacao.title}</h3>
                    <p className="text-sm md:text-base text-gray-600 mb-4 leading-relaxed">{votacao.description}</p>

                    {votacao.user_vote ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-xs md:text-sm text-blue-900 text-center">
                          <strong>✅ Voto registrado!</strong> Você votou: <span className="uppercase font-bold">{votacao.user_vote}</span>
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 md:gap-3">
                        <button 
                          onClick={() => votar(votacao.id, 'favor')} 
                          className="bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition text-xs md:text-base"
                        >
                          👍 A Favor
                        </button>
                        <button 
                          onClick={() => votar(votacao.id, 'contra')} 
                          className="bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition text-xs md:text-base"
                        >
                          👎 Contra
                        </button>
                        <button 
                          onClick={() => votar(votacao.id, 'abstencao')} 
                          className="bg-gray-400 text-white py-3 rounded-lg font-bold hover:bg-gray-500 transition text-xs md:text-base"
                        >
                          🤷 Abstenção
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Votações Anteriores */}
      {encerradas.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Votações Anteriores</h2>
          <div className="space-y-4">
            {encerradas.map((votacao) => {
              const favorPercent = votacao.votes.total > 0 ? Math.round((votacao.votes.favor / votacao.votes.total) * 100) : 0
              const contraPercent = votacao.votes.total > 0 ? Math.round((votacao.votes.contra / votacao.votes.total) * 100) : 0
              const aprovada = favorPercent > 50

              return (
                <div key={votacao.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${aprovada ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {aprovada ? '✅ MAIORIA FAVORÁVEL' : '❌ MAIORIA CONTRÁRIA'}
                      </span>
                      <h4 className="font-bold text-gray-900 mt-2 text-base md:text-lg">{votacao.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">Encerrada em {formatDate(votacao.end_date)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-sm mb-3">
                    <div>
                      <p className="font-bold text-green-600">{votacao.votes.favor} votos</p>
                      <p className="text-gray-600 text-xs">A Favor ({favorPercent}%)</p>
                    </div>
                    <div>
                      <p className="font-bold text-red-600">{votacao.votes.contra} votos</p>
                      <p className="text-gray-600 text-xs">Contra ({contraPercent}%)</p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-400">{votacao.votes.abstencao} votos</p>
                      <p className="text-gray-600 text-xs">Abstenção</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {votacoes.length === 0 && (
        <EmptyState icon="🗳️" title="Nenhuma votação" description="Não há votações no momento." />
      )}
    </PageLayout>
  )
}