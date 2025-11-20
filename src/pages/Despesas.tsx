import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { formatCurrency, formatDate } from '../lib/utils'
import PageLayout from '../components/PageLayout'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

interface Despesa {
  id: string
  description: string // Correção: DB usa description
  amount: number
  category: string | null
  due_date: string    // Correção: DB usa due_date
  paid_at: string | null
  receipt_url: string | null
  created_at: string
}

// Mapeamento visual para categorias (que no banco são texto livre)
const CATEGORY_CONFIG: Record<string, any> = {
  'água': { icon: '💧', color: 'bg-blue-100' },
  'energia': { icon: '⚡', color: 'bg-yellow-100' },
  'luz': { icon: '⚡', color: 'bg-yellow-100' },
  'limpeza': { icon: '✨', color: 'bg-green-100' },
  'manutenção': { icon: '🔧', color: 'bg-orange-100' },
  'segurança': { icon: '🛡️', color: 'bg-red-100' },
  'pessoal': { icon: '👥', color: 'bg-purple-100' },
  'default': { icon: '📝', color: 'bg-gray-100' }
}

function getCategoryStyle(category: string | null) {
  if (!category) return CATEGORY_CONFIG.default
  const key = Object.keys(CATEGORY_CONFIG).find(k => category.toLowerCase().includes(k))
  return key ? CATEGORY_CONFIG[key] : CATEGORY_CONFIG.default
}

export default function Despesas() {
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    loadDespesas()
  }, [])

  async function loadDespesas() {
    try {
      const { data, error } = await supabase
        .from('despesas')
        .select('*')
        .order('due_date', { ascending: false })

      if (error) throw error
      setDespesas(data || [])
    } catch (error) {
      console.error('Erro ao carregar despesas:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDespesas = selectedCategory
    ? despesas.filter(d => d.category === selectedCategory)
    : despesas

  const totalMes = despesas.reduce((sum, d) => sum + Number(d.amount), 0)

  if (loading) return <LoadingSpinner message="Carregando despesas..." />

  // Extrair categorias únicas para o filtro
  const uniqueCategories = Array.from(new Set(despesas.map(d => d.category).filter(Boolean))) as string[]

  return (
    <PageLayout
      title="Feed Financeiro"
      subtitle="Transparência total das despesas do condomínio"
      icon="💰"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-600 mb-1">Total Registrado</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{formatCurrency(totalMes)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-600 mb-1">Lançamentos</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{despesas.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-600 mb-1">Status</p>
          <p className="text-xl font-bold text-green-600">Atualizado</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              !selectedCategory
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          {uniqueCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition capitalize ${
                selectedCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      {filteredDespesas.length > 0 ? (
        <div className="space-y-4">
          {filteredDespesas.map((despesa) => {
            const style = getCategoryStyle(despesa.category)
            
            return (
              <div
                key={despesa.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${style.color} flex-shrink-0`}>
                        <span className="text-3xl">{style.icon}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900 text-base md:text-lg capitalize">
                          {despesa.description}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-500">
                          Vencimento: {formatDate(despesa.due_date)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xl md:text-2xl font-bold text-gray-900 flex-shrink-0">
                      {formatCurrency(Number(despesa.amount))}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    {despesa.category && (
                      <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded capitalize text-gray-600">
                        {despesa.category}
                      </span>
                    )}
                    
                    {despesa.paid_at ? (
                       <span className="text-xs text-green-600 font-bold">Pago em {formatDate(despesa.paid_at)}</span>
                    ) : (
                       <span className="text-xs text-orange-600 font-bold">Aberto</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon="📊"
          title="Nenhuma despesa"
          description="Não há despesas para exibir com estes filtros."
          action={{
            label: 'Limpar Filtros',
            onClick: () => setSelectedCategory(null),
          }}
        />
      )}
    </PageLayout>
  )
}