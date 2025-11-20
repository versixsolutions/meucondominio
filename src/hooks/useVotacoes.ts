import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Votacao, VotacaoStats, VotacaoWithStats } from '../types'

export function useVotacoes(filter: 'all' | 'ativa' | 'encerrada' = 'all') {
  const [votacoes, setVotacoes] = useState<VotacaoWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadVotacoes()
  }, [filter])

  async function loadVotacoes() {
    try {
      setLoading(true)
      setError(null)

      // Query base
      let query = supabase
        .from('votacoes')
        .select('*')
        .order('end_date', { ascending: false })

      // Filtrar por status se necessário
      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data: votacoesData, error: votacoesError } = await query

      if (votacoesError) throw votacoesError

      // Buscar stats para cada votação
      const votacoesWithStats: VotacaoWithStats[] = await Promise.all(
        (votacoesData || []).map(async (votacao) => {
          const { data: statsData } = await supabase
            .rpc('get_votacao_stats', { votacao_uuid: votacao.id })
            .single()

          return {
            ...votacao,
            stats: statsData || {
              total_votes: 0,
              votes_favor: 0,
              votes_contra: 0,
              votes_abstencao: 0,
              participation_rate: 0,
            },
          }
        })
      )

      setVotacoes(votacoesWithStats)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido'))
    } finally {
      setLoading(false)
    }
  }

  return { votacoes, loading, error, reload: loadVotacoes }
}
