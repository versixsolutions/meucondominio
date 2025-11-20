import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface FAQ {
  id: string
  question: string
  answer: string
  helpful_count: number
}

export default function Test() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadFAQs() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('faqs')
          .select('*')
          .limit(5)

        if (error) throw error

        setFaqs(data || [])
        console.log('✅ FAQs carregadas:', data)
      } catch (err) {
        console.error('❌ Erro:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    loadFAQs()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Carregando...</h1>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Erro!</h1>
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-green-600 mb-4">
        ✅ Conexão Supabase Funcionando!
      </h1>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-green-800 font-semibold">
          {faqs.length} FAQs carregadas do banco de dados
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-900">{faq.question}</h3>
            <p className="text-gray-600 text-sm mt-2">{faq.answer}</p>
            <p className="text-gray-400 text-xs mt-2">
              👍 {faq.helpful_count} pessoas acharam útil
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
