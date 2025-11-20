import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import PageLayout from '../components/PageLayout'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

interface FAQ {
  id: string
  category: string
  question: string
  answer: string
  votes_helpful: number
  votes_not_helpful: number
}

const CATEGORIES = {
  geral: { label: 'Geral', icon: '📋', color: 'blue' },
  regras: { label: 'Regras', icon: '📜', color: 'purple' },
  manutencao: { label: 'Manutenção', icon: '🔧', color: 'orange' },
  financeiro: { label: 'Financeiro', icon: '💰', color: 'green' },
  areas_comuns: { label: 'Áreas Comuns', icon: '🏊', color: 'cyan' },
}

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    loadFAQs()
  }, [])

  async function loadFAQs() {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('votes_helpful', { ascending: false })

      if (error) throw error
      setFaqs(data || [])
    } catch (error) {
      console.error('Erro ao carregar FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  async function voteHelpful(faqId: string) {
    try {
      const faq = faqs.find(f => f.id === faqId)
      if (!faq) return

      const { error } = await supabase
        .from('faqs')
        .update({ votes_helpful: faq.votes_helpful + 1 })
        .eq('id', faqId)

      if (error) throw error

      setFaqs(prev => prev.map(f => 
        f.id === faqId ? { ...f, votes_helpful: f.votes_helpful + 1 } : f
      ))
    } catch (error) {
      console.error('Erro ao votar:', error)
    }
  }

  async function voteNotHelpful(faqId: string) {
    try {
      const faq = faqs.find(f => f.id === faqId)
      if (!faq) return

      const { error } = await supabase
        .from('faqs')
        .update({ votes_not_helpful: faq.votes_not_helpful + 1 })
        .eq('id', faqId)

      if (error) throw error

      setFaqs(prev => prev.map(f => 
        f.id === faqId ? { ...f, votes_not_helpful: f.votes_not_helpful + 1 } : f
      ))
    } catch (error) {
      console.error('Erro ao votar:', error)
    }
  }

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const groupedFAQs = filteredFAQs.reduce((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = []
    acc[faq.category].push(faq)
    return acc
  }, {} as Record<string, FAQ[]>)

  if (loading) return <LoadingSpinner message="Carregando perguntas frequentes..." />

  return (
    <PageLayout
      title="Perguntas Frequentes"
      subtitle="Encontre respostas rápidas para suas dúvidas"
      icon="❓"
    >
      {/* Search - IGUAL PROTÓTIPO */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 sticky top-24 z-30">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Busque sua dúvida aqui... (ex: piscina, pet, churrasqueira)"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm md:text-base"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          <strong>{filteredFAQs.length} perguntas</strong> foram respondidas automaticamente este mês 🎉
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition ${
            !selectedCategory
              ? 'bg-primary text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Todas
        </button>
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition ${
              selectedCategory === key
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* FAQ List - IGUAL PROTÓTIPO */}
      {Object.keys(groupedFAQs).length > 0 ? (
        Object.entries(groupedFAQs).map(([category, categoryFAQs]) => {
          const catInfo = CATEGORIES[category as keyof typeof CATEGORIES]
          return (
            <div key={category} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">{catInfo.icon}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{catInfo.label}</h2>
                  <p className="text-sm text-gray-500">{categoryFAQs.length} perguntas</p>
                </div>
              </div>

              <div className="space-y-4">
                {categoryFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
                  >
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 mb-3 text-base md:text-lg">
                        {faq.question}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        {faq.answer}
                      </p>
                      
                      {/* Votos - DESTAQUE COMO PROTÓTIPO */}
                      <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => voteHelpful(faq.id)}
                          className="flex items-center gap-2 text-green-600 hover:text-green-700 transition group"
                        >
                          <span className="text-lg group-hover:scale-125 transition">👍</span>
                          <span className="text-sm font-semibold">
                            Útil ({faq.votes_helpful})
                          </span>
                        </button>
                        <button
                          onClick={() => voteNotHelpful(faq.id)}
                          className="flex items-center gap-2 text-gray-400 hover:text-red-600 transition group"
                        >
                          <span className="text-lg group-hover:scale-125 transition">👎</span>
                          <span className="text-sm">
                            Não útil ({faq.votes_not_helpful})
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })
      ) : (
        <EmptyState
          icon="🔍"
          title="Nenhum resultado encontrado"
          description="Tente buscar com outras palavras ou remova os filtros."
          action={{
            label: 'Limpar Busca',
            onClick: () => {
              setSearchTerm('')
              setSelectedCategory(null)
            },
          }}
        />
      )}

      {/* CTA Chatbot - IGUAL PROTÓTIPO */}
      <div className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">💬</span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">Não encontrou sua resposta?</h3>
            <p className="text-purple-100 text-sm mb-4">
              Pergunte ao assistente virtual ou direto ao síndico!
            </p>
            <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50 transition">
              Fazer Pergunta
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
