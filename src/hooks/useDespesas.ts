import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Despesa, DespesasStats } from '../types'

export function useDespesas(categoryFilter?: string) {
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [stats, setStats] = useState<DespesasStats>({
    total: 0,
    count: 0,
    biggestCategory: '',
    biggestAmount: 0,
    comparisonPrevMonth: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadDespesas()
  }, [categoryFilter])

  async function loadDespesas() {
    try {
      setLoading(true)
      setError(null)

      // Query base
      let query = supabase
        .from('despesas')
        .select(`
          *,
          category:despesa_categories(*)
        `)
        .order('payment_date', { ascending: false })

      // Filtrar por categoria se especificado
      if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('category_id', categoryFilter)
      }

      const { data, error: queryError } = await query

      if (queryError) throw queryError

      setDespesas(data || [])

      // Calcular stats
      if (data && data.length > 0) {
        const total = data.reduce((sum, d) => sum + Number(d.amount), 0)
        
        // Maior despesa
        const biggest = data.reduce((max, d) => 
          Number(d.amount) > Number(max.amount) ? d : max
        )

        setStats({
          total,
          count: data.length,
          biggestCategory: biggest.category?.name || 'Outros',
          biggestAmount: Number(biggest.amount),
          comparisonPrevMonth: 12, // TODO: calcular real
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido'))
    } finally {
      setLoading(false)
    }
  }

  return { despesas, stats, loading, error, reload: loadDespesas }
}
