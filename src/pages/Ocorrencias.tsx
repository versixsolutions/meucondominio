import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { formatDateTime } from '../lib/utils'
import PageLayout from '../components/PageLayout'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

interface Ocorrencia {
  id: string
  title: string
  description: string
  status: string
  // priority: string // Removido se não existir na tabela, ou mantido se criou
  location: string | null
  photo_url: string | null
  created_at: string
  resolved_at: string | null
  author: {
    full_name: string
    unit_number: string
  } | null
}

const STATUS_CONFIG: any = {
  aberto: { label: 'Aberto', color: 'bg-blue-100 text-blue-700 border-blue-500', icon: '🆕' },
  em_andamento: { label: 'Em Andamento', color: 'bg-orange-100 text-orange-700 border-orange-500', icon: '⏳' },
  resolvido: { label: 'Resolvido', color: 'bg-green-100 text-green-700 border-green-500', icon: '✅' },
  arquivado: { label: 'Arquivado', color: 'bg-gray-100 text-gray-700 border-gray-300', icon: '🔒' },
}

export default function Ocorrencias() {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  useEffect(() => {
    loadOcorrencias()
  }, [])

  async function loadOcorrencias() {
    try {
      const { data, error } = await supabase
        .from('ocorrencias')
        .select(`
          id,
          title,
          description,
          status,
          created_at,
          resolved_at,
          author:author_id (
            full_name,
            unit_number
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Ajuste para flat map se author vier como array
      const formatted = data?.map(o => ({
        ...o,
        author: Array.isArray(o.author) ? o.author[0] : o.author,
      })) || []

      setOcorrencias(formatted as any)
    } catch (error) {
      console.error('Erro ao carregar ocorrências:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOcorrencias = selectedStatus
    ? ocorrencias.filter(o => o.status === selectedStatus)
    : ocorrencias

  const stats = {
    abertas: ocorrencias.filter(o => o.status === 'aberto').length,
    em_andamento: ocorrencias.filter(o => o.status === 'em_andamento').length,
    resolvidas: ocorrencias.filter(o => o.status === 'resolvido').length,
  }

  if (loading) return <LoadingSpinner message="Carregando ocorrências..." />

  return (
    <PageLayout
      title="Central de Ocorrências"
      subtitle="Acompanhe e reporte problemas do condomínio"
      icon="🚨"
      headerAction={
        <button className="bg-white text-purple-600 px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold hover:bg-purple-50 transition text-sm md:text-base flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova Ocorrência
        </button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-2xl md:text-3xl font-bold text-blue-600">{stats.abertas}</p>
          <p className="text-xs md:text-sm text-gray-600">Abertas</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-2xl md:text-3xl font-bold text-orange-600">{stats.em_andamento}</p>
          <p className="text-xs md:text-sm text-gray-600">Em Andamento</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-2xl md:text-3xl font-bold text-green-600">{stats.resolvidas}</p>
          <p className="text-xs md:text-sm text-gray-600">Resolvidas</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStatus(null)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${!selectedStatus ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Todas
          </button>
          {Object.entries(STATUS_CONFIG).map(([key, config]: any) => (
            <button
              key={key}
              onClick={() => setSelectedStatus(key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${selectedStatus === key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {config.icon} {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {filteredOcorrencias.length > 0 ? (
        <div className="space-y-4">
          {filteredOcorrencias.map((ocorrencia) => {
            const statusConfig = STATUS_CONFIG[ocorrencia.status] || STATUS_CONFIG.aberto
            
            return (
              <div
                key={ocorrencia.id}
                className={`bg-white rounded-xl shadow-sm border-l-4 overflow-hidden hover:shadow-md transition ${statusConfig.border}`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.color}`}>
                          {statusConfig.icon} {statusConfig.label}
                        </span>
                        <span className="text-xs text-gray-500">#{ocorrencia.id.slice(0, 8)}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-base md:text-lg">{ocorrencia.title}</h3>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">{ocorrencia.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <span>📅 {formatDateTime(ocorrencia.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>👤 {ocorrencia.author?.full_name || 'Anônimo'} ({ocorrencia.author?.unit_number || '-'})</span>
                    </div>
                  </div>

                  {/* Resolvido */}
                  {ocorrencia.status === 'resolvido' && ocorrencia.resolved_at && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-xs md:text-sm text-green-900">
                        <strong>✅ Resolvido em:</strong> {formatDateTime(ocorrencia.resolved_at)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon="🎉"
          title="Nenhuma ocorrência"
          description="Não há ocorrências nesta categoria. Tudo está tranquilo!"
          action={{ label: 'Ver Todas', onClick: () => setSelectedStatus(null) }}
        />
      )}
    </PageLayout>
  )
}