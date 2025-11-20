import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface FAQ {
  id: string
  question: string
  answer: string
  category_id: string | null
  helpful_count: number
  not_helpful_count: number
  created_at: string
}

interface Category {
  id: string
  name: string
  icon: string | null
  order_index: number
}

interface FAQsByCategory {
  category: Category
  faqs: FAQ[]
}

export function useFAQs(searchQuery?: string) {
  const [data, setData] = useState<FAQsByCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadFAQs() {
      try {
        setLoading(true)
        setError(null)

        // Buscar categorias
        const { data: categories, error: catError } = await supabase
          .from('faq_categories')
          .select('*')
          .order('order_index', { ascending: true })

        if (catError) throw catError

        // Buscar FAQs
        let query = supabase
          .from('faqs')
          .select('*')
          .order('created_at', { ascending: false })

        // Se houver busca, filtrar
        if (searchQuery && searchQuery.trim()) {
          query = query.or(
            `question.ilike.%${searchQuery}%,answer.ilike.%${searchQuery}%`
          )
        }

        const { data: faqs, error: faqError } = await query

        if (faqError) throw faqError

        // Agrupar FAQs por categoria
        const grouped: FAQsByCategory[] = (categories || []).map((cat) => ({
          category: cat,
          faqs: (faqs || []).filter((faq) => faq.category_id === cat.id),
        }))

        // Adicionar FAQs sem categoria
        const uncategorized = (faqs || []).filter((faq) => !faq.category_id)
        if (uncategorized.length > 0) {
          grouped.push({
            category: {
              id: 'uncategorized',
              name: 'Outras',
              icon: '📋',
              order_index: 999,
            },
            faqs: uncategorized,
          })
        }

        setData(grouped)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro desconhecido'))
      } finally {
        setLoading(false)
      }
    }

    loadFAQs()
  }, [searchQuery])

  return { data, loading, error }
}
