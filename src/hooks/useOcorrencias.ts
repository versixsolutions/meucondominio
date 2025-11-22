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
    loadData()
  }, [statusFilter])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)

      // 1. Buscar Lista (com filtro se necessário)
      let query = supabase
        .from('ocorrencias')
        .select('*')
        .order('created_at', { ascending: false })

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data: listData, error: listError } = await query
      if (listError) throw listError
      setOcorrencias(listData || [])

      // 2. Buscar Estatísticas Otimizadas (Count direto no banco)
      // Abertas
      const { count: countAbertas } = await supabase
        .from('ocorrencias')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'aberto')

      // Em Andamento
      const { count: countAndamento } = await supabase
        .from('ocorrencias')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'em_andamento')

      // Resolvidas no Mês Atual
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

      const { count: countResolvidas } = await supabase
        .from('ocorrencias')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'resolvido')
        .gte('resolved_at', startOfMonth)
        .lte('resolved_at', endOfMonth)

      setStats({
        abertas: countAbertas || 0,
        em_andamento: countAndamento || 0,
        resolvidas_mes: countResolvidas || 0,
        total: listData?.length || 0,
      })

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido'))
    } finally {
      setLoading(false)
    }
  }

  return { ocorrencias, stats, loading, error, reload: loadData }
}