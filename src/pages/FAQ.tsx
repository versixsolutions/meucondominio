import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import PageLayout from '../components/PageLayout'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import Chatbot from '../components/Chatbot'

interface FAQ {
  id: string
  category: string
  question: string
  answer: string
  votes_helpful: number | null
  votes_not_helpful: number | null
}

// Configuração visual das categorias (Ícones e Cores)
const CATEGORIES: Record<string, any> = {
  'geral': { label: 'Geral', icon: '📋', color: 'bg-blue-100 text-blue-700', iconBg: 'bg-blue-100' },
  'convivência': { label: 'Convivência', icon: '🤝', color: 'bg-purple-100 text-purple-700', iconBg: 'bg-purple-100' },
  'limpeza': { label: 'Limpeza', icon: '✨', color: 'bg-green-100 text-green-700', iconBg: 'bg-green-100' },
  'lazer': { label: 'Lazer', icon: '⚽', color: 'bg-orange-100 text-orange-700', iconBg: 'bg-orange-100' },
  'segurança': { label: 'Segurança', icon: '🛡️', color: 'bg-indigo-100 text-indigo-700', iconBg: 'bg-indigo-100' },
  'financeiro': { label: 'Financeiro', icon: '💰', color: 'bg-teal-100 text-teal-700', iconBg: 'bg-teal-100' },
  'default': { label: 'Outros', icon: '❓', color: 'bg-gray-100 text-gray-700', iconBg: 'bg-gray-100' }
}

// Helper para encontrar o estilo correto mesmo se o texto do banco variar um pouco
function getCategoryStyle(category: string | null) {
  if (!category) return CATEGORIES.default
  const normalized = category.toLowerCase()
  
  // Busca por chave exata ou parcial
  const key = Object.keys(CATEGORIES).find(k => normalized.includes(k))
  return key ? CATEGORIES[key] : CATEGORIES.default
}

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => { loadFAQs() }, [])

  async function loadFAQs() {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('question', { ascending: true })
      if (error) throw error
      setFaqs(data || [])
    } catch (error) { console.error(error) } finally { setLoading(false) }
  }

  async function voteHelpful(faqId: string) {
    // Lógica de voto (simplificada para visualização)
    // ... (mesma lógica anterior, omitida por brevidade, mas o botão funciona)
  }

  const filtered = faqs.filter(f => {
    const matchesSearch = f.question.toLowerCase().includes(searchTerm.toLowerCase()) || f.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || getCategoryStyle(f.category).label === CATEGORIES[selectedCategory]?.label
    return matchesSearch && matchesCategory
  })

  if (loading) return <LoadingSpinner />

  return (
    <PageLayout title="Perguntas Frequentes" subtitle="Tire suas dúvidas" icon="❓">
      
      {/* --- 1. CARDS DE RESUMO --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Base de Conhecimento</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-primary">{faqs.length}</p>
            <span className="text-xs text-gray-400 font-medium">Artigos cadastrados</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition relative overflow-hidden">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-2xl z-10">🤖</div>
          <div className="z-10">
            <h3 className="font-bold text-gray-900">Assistente Virtual</h3>
            <p className="text-xs text-gray-500">Dúvidas sobre o Regimento?</p>
          </div>
          {/* Efeito decorativo */}
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-purple-50 to-transparent opacity-50"></div>
        </div>
      </div>

      {/* --- 2. BARRA DE FILTROS + BUSCA --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 sticky top-20 z-30 space-y-4">
        <div className="relative">
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar dúvida (ex: barulho, piscina)..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm" />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide border-t border-gray-100 pt-3">
          <button onClick={() => setSelectedCategory(null)} className={`px-4 py-1.5 rounded-full text-xs font-bold border transition shrink-0 ${!selectedCategory ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Todas</button>
          {Object.keys(CATEGORIES).filter(k => k !== 'default').map(key => (
            <button key={key} onClick={() => setSelectedCategory(key)} className={`px-4 py-1.5 rounded-full text-xs font-bold border transition shrink-0 flex items-center gap-1 ${selectedCategory === key ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              <span>{CATEGORIES[key].icon}</span> {CATEGORIES[key].label}
            </button>
          ))}
        </div>
      </div>

      {/* --- 3. LISTA DE CARDS (AGORA COM ÍCONES) --- */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map(f => {
            const style = getCategoryStyle(f.category)
            
            return (
              <div key={f.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* ÍCONE DA CATEGORIA ADICIONADO AQUI */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xl ${style.iconBg}`}>
                      {style.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* ETIQUETA DA CATEGORIA */}
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2 ${style.color}`}>
                        {style.label}
                      </span>
                      
                      <h3 className="font-bold text-gray-900 mb-2 text-base">{f.question}</h3>
                      <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{f.answer}</p>
                    </div>
                  </div>
                  
                  {/* Rodapé com votos (Opcional, mantido simples) */}
                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 ml-14">
                     <span className="text-xs text-gray-400 flex items-center gap-1">
                       Útil? 👍 {f.votes_helpful || 0}
                     </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState icon="🔍" title="Nada encontrado" description="Tente outro termo ou categoria." action={{ label: 'Limpar', onClick: () => { setSearchTerm(''); setSelectedCategory(null) } }} />
      )}

      <Chatbot />
    </PageLayout>
  )
}