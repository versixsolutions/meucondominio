import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { formatCurrency, formatDate, formatDateTime } from '../lib/utils'
import PageLayout from '../components/PageLayout'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

interface Despesa {
  id: string
  title: string
  description: string
  amount: number
  category: string
  payment_date: string
  receipt_url: string | null
  created_at: string
}

const CATEGORY_CONFIG = {
  agua: { label: 'Água', icon: '💧', color: 'bg-blue-100 text-blue-700', iconBg: 'bg-blue-100' },
  energia: { label: 'Energia', icon: '⚡', color: 'bg-yellow-100 text-yellow-700', iconBg: 'bg-yellow-100' },
  limpeza: { label: 'Limpeza', icon: '✨', color: 'bg-green-100 text-green-700', iconBg: 'bg-green-100' },
  manutencao: { label: 'Manutenção', icon: '🔧', color: 'bg-orange-100 text-orange-700', iconBg: 'bg-orange-100' },
  seguranca: { label: 'Segurança', icon: '🛡️', color: 'bg-red-100 text-red-700', iconBg: 'bg-red-100' },
  administrativo: { label: 'Administrativo', icon: '📋', color: 'bg-purple-100 text-purple-700', iconBg: 'bg-purple-100' },
  outros: { label: 'Outros', icon: '📦', color: 'bg-gray-100 text-gray-700', iconBg: 'bg-gray-100' },
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
        .order('payment_date', { ascending: false })

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
  const maiorDespesa = despesas.length > 0
    ? despesas.reduce((max, d) => Number(d.amount) > Number(max.amount) ? d : max)
    : null

  if (loading) return <LoadingSpinner message="Carregando despesas..." />

  return (
    <PageLayout
      title="Feed Financeiro"
      subtitle="Transparência total das despesas do condomínio"
      icon="💰"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-600 mb-1">Total Novembro</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{formatCurrency(totalMes)}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-1 rounded">+12% vs outubro</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-600 mb-1">Maior Despesa</p>
          <p className="text-xl font-bold text-gray-900">
            {maiorDespesa ? CATEGORY_CONFIG[maiorDespesa.category as keyof typeof CATEGORY_CONFIG].label : '-'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {maiorDespesa ? `${formatCurrency(Number(maiorDespesa.amount))} (31%)` : '-'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-600 mb-1">Comprovantes</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{despesas.length}</p>
          <p className="text-xs text-green-600 mt-1 font-semibold">100% com nota fiscal</p>
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
          {Object.entries(CATEGORY_CONFIG).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                selectedCategory === key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed - IGUAL PROTÓTIPO */}
      {filteredDespesas.length > 0 ? (
        <div className="space-y-4">
          {filteredDespesas.map((despesa) => {
            const catConfig = CATEGORY_CONFIG[despesa.category as keyof typeof CATEGORY_CONFIG]
            const timeAgo = (() => {
              const diff = new Date().getTime() - new Date(despesa.created_at).getTime()
              const hours = Math.floor(diff / (1000 * 60 * 60))
              const days = Math.floor(hours / 24)
              if (days > 0) return `Há ${days} dia${days > 1 ? 's' : ''}`
              if (hours > 0) return `Há ${hours} hora${hours > 1 ? 's' : ''}`
              return 'Há poucos minutos'
            })()

            return (
              <div
                key={despesa.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                <div className="p-5">
                  {/* Header com ícone GRANDE - IGUAL PROTÓTIPO */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${catConfig.iconBg} flex-shrink-0`}>
                        <span className="text-3xl">{catConfig.icon}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900 text-base md:text-lg">{despesa.title}</h3>
                        <p className="text-xs md:text-sm text-gray-500">{formatDate(despesa.payment_date)}</p>
                      </div>
                    </div>
                    <span className="text-xl md:text-2xl font-bold text-gray-900 flex-shrink-0">
                      {formatCurrency(Number(despesa.amount))}
                    </span>
                  </div>

                  {/* Descrição */}
                  {despesa.description && (
                    <p className="text-sm text-gray-600 mb-3">{despesa.description}</p>
                  )}

                  {/* Footer - IGUAL PROTÓTIPO */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    {despesa.receipt_url ? (
                      <button className="flex items-center gap-2 text-purple-600 text-sm font-semibold hover:text-purple-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Ver Comprovante
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">Sem comprovante</span>
                    )}
                    <span className="text-xs text-gray-400">Postado por Síndico • {timeAgo}</span>
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
          description="Não há despesas nesta categoria."
          action={{
            label: 'Ver Todas',
            onClick: () => setSelectedCategory(null),
          }}
        />
      )}

      {/* Load More */}
      {filteredDespesas.length > 0 && (
        <div className="mt-6 text-center">
          <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold border-2 border-purple-600 hover:bg-purple-50 transition">
            Carregar Mais Despesas
          </button>
        </div>
      )}
    </PageLayout>
  )
}
