import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { DespesaCategory } from '../types'

export function useDespesaCategories() {
  const [categories, setCategories] = useState<DespesaCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    try {
      setLoading(true)
      setError(null)

      const { data, error: queryError } = await supabase
        .from('despesa_categories')
        .select('*')
        .order('order_index', { ascending: true })

      if (queryError) throw queryError

      setCategories(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido'))
    } finally {
      setLoading(false)
    }
  }

  return { categories, loading, error }
}
