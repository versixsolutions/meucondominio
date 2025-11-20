import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

interface Category {
  id: string
  name: string
}

interface FAQFormProps {
  faqId?: string
  initialData?: {
    question: string
    answer: string
    category_id: string | null
  }
  onSuccess: () => void
  onCancel: () => void
}

export default function FAQForm({ faqId, initialData, onSuccess, onCancel }: FAQFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    question: initialData?.question || '',
    answer: initialData?.answer || '',
    category_id: initialData?.category_id || '',
  })

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    const { data } = await supabase
      .from('faq_categories')
      .select('id, name')
      .order('order_index')
    
    if (data) setCategories(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      if (faqId) {
        // UPDATE
        const { error } = await supabase
          .from('faqs')
          .update({
            question: formData.question,
            answer: formData.answer,
            category_id: formData.category_id || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', faqId)

        if (error) throw error
      } else {
        // INSERT
        const { error } = await supabase
          .from('faqs')
          .insert({
            question: formData.question,
            answer: formData.answer,
            category_id: formData.category_id || null,
          })

        if (error) throw error
      }

      onSuccess()
    } catch (error) {
      console.error('Erro ao salvar FAQ:', error)
      alert('Erro ao salvar FAQ. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Categoria */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Categoria
        </label>
        <select
          value={formData.category_id}
          onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
        >
          <option value="">Sem categoria</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Pergunta */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Pergunta *
        </label>
        <input
          type="text"
          value={formData.question}
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          placeholder="Ex: Qual o horário da piscina?"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Resposta */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Resposta *
        </label>
        <textarea
          value={formData.answer}
          onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
          placeholder="Digite a resposta completa..."
          required
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
        />
      </div>

      {/* Botões */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Salvando...' : faqId ? 'Atualizar FAQ' : 'Adicionar FAQ'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
