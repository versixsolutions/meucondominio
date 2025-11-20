import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Ocorrencia, OcorrenciasStats } from '../types'

export function useOcorrencias(statusFilter?: string) {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([])
  const [stats, setStats] = useState<OcorrenciasStats>({
    abertas: 0,
    em_andamento: 0,
    resolvidas_mes: 0,
    total: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadOcorrencias()
  }, [statusFilter])

  async function loadOcorrencias() {
    try {
      setLoading(true)
      setError(null)

      // Query base
      let query = supabase
        .from('ocorrencias')
        .select('*')
        .order('created_at', { ascending: false })

      // Filtrar por status
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error: queryError } = await query

      if (queryError) throw queryError

      setOcorrencias(data || [])

            // Otimização: O cálculo de stats deve ser feito no backend (via RPC/Edge Function)
      // ou, no mínimo, as estatísticas devem ser buscadas separadamente com filtros.
      // Por enquanto, mantemos o cálculo no frontend, mas com a ressalva de otimização futura.
      if (data) {
        const abertas = data.filter(o => o.status === 'aberto').length
        const em_andamento = data.filter(o => o.status === 'em_andamento').length
        
        // Resolvidas este mês: Otimização para usar o filtro de data no Supabase
        // Para simplificar a refatoração, vamos manter o cálculo no frontend, mas com a ressalva.
        // A melhoria seria usar: .gte('resolved_at', startOfMonth) e .lte('resolved_at', endOfMonth)
        const mesAtual = new Date().getMonth()
        const anoAtual = new Date().getFullYear()
        const resolvidas_mes = data.filter(o => {
          if (o.status !== 'resolvido' || !o.resolved_at) return false
          const resolvedDate = new Date(o.resolved_at)
          return resolvedDate.getMonth() === mesAtual && resolvedDate.getFullYear() === anoAtual
        }).length

        setStats({
          abertas,
          em_andamento,
          resolvidas_mes,
          total: data.length,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido'))
    } finally {
      setLoading(false)
    }
  }

  return { ocorrencias, stats, loading, error, reload: loadOcorrencias }
}
