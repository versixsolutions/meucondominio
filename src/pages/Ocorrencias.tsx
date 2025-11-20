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
  priority: string
  location: string
  photo_url: string | null
  created_at: string
  resolved_at: string | null
  reporter: {
    full_name: string
    unit_number: string
  }
}

const STATUS_CONFIG = {
  aberto: { label: 'Aberto', color: 'bg-blue-100 text-blue-700 border-blue-500', icon: '🆕', dotColor: 'bg-blue-500' },
  em_andamento: { label: 'Em Andamento', color: 'bg-orange-100 text-orange-700 border-orange-500', icon: '⏳', dotColor: 'bg-orange-500' },
  resolvido: { label: 'Resolvido', color: 'bg-green-100 text-green-700 border-green-500', icon: '✅', dotColor: 'bg-green-500' },
  fechado: { label: 'Fechado', color: 'bg-gray-100 text-gray-700 border-gray-300', icon: '🔒', dotColor: 'bg-gray-400' },
}

const PRIORITY_CONFIG = {
  baixa: { label: 'Baixa', color: 'text-gray-600' },
  normal: { label: 'Normal', color: 'text-blue-600' },
  alta: { label: 'Alta', color: 'text-orange-600' },
  urgente: { label: 'Urgente', color: 'text-red-600', badge: 'bg-red-100 text-red-700' },
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
          priority,
          location,
          photo_url,
          created_at,
          resolved_at,
          reporter:reported_by (
            full_name,
            unit_number
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formatted = data?.map(o => ({
        ...o,
        reporter: Array.isArray(o.reporter) ? o.reporter[0] : o.reporter,
      })) || []

      setOcorrencias(formatted)
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
          <p className="text-xs md:text-sm text-gray-600">Resolvidas (mês)</p>
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
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
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

      {/* Lista - IGUAL PROTÓTIPO */}
      {filteredOcorrencias.length > 0 ? (
        <div className="space-y-4">
          {filteredOcorrencias.map((ocorrencia) => {
            const statusConfig = STATUS_CONFIG[ocorrencia.status as keyof typeof STATUS_CONFIG]
            const priorityConfig = PRIORITY_CONFIG[ocorrencia.priority as keyof typeof PRIORITY_CONFIG]
            const timeAgo = (() => {
              const diff = new Date().getTime() - new Date(ocorrencia.created_at).getTime()
              const hours = Math.floor(diff / (1000 * 60 * 60))
              const days = Math.floor(hours / 24)
              if (days > 0) return `Há ${days} dia${days > 1 ? 's' : ''}`
              if (hours > 0) return `Há ${hours} hora${hours > 1 ? 's' : ''}`
              return 'Há poucos minutos'
            })()

            return (
              <div
                key={ocorrencia.id}
                className={`bg-white rounded-xl shadow-sm border-l-4 overflow-hidden hover:shadow-md transition ${statusConfig.border}`}
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.color}`}>
                          {statusConfig.icon} {statusConfig.label}
                        </span>
                        {ocorrencia.priority === 'urgente' && (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${priorityConfig.badge}`}>
                            🚨 URGENTE
                          </span>
                        )}
                        <span className="text-xs text-gray-500">#{ocorrencia.id.slice(0, 8)}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-base md:text-lg">{ocorrencia.title}</h3>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">{ocorrencia.description}</p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500 mb-4">
                    {ocorrencia.location && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{ocorrencia.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{timeAgo}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{ocorrencia.reporter?.full_name || 'Anônimo'} ({ocorrencia.reporter?.unit_number || '-'})</span>
                    </div>
                  </div>

                  {/* Timeline - IGUAL PROTÓTIPO */}
                  {ocorrencia.status === 'em_andamento' && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm font-semibold text-gray-900 mb-3">Timeline:</p>
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"></div>
                            <div className="w-0.5 h-full bg-gray-300 mt-1"></div>
                          </div>
                          <div className="flex-1 pb-2">
                            <p className="text-xs text-gray-500">{formatDateTime(ocorrencia.created_at)}</p>
                            <p className="text-sm text-gray-700">• Ocorrência aberta por {ocorrencia.reporter?.full_name}</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 mt-1.5"></div>
                            <div className="w-0.5 h-full bg-gray-300 mt-1"></div>
                          </div>
                          <div className="flex-1 pb-2">
                            <p className="text-xs text-gray-500">Hoje 14:30</p>
                            <p className="text-sm text-gray-700">• Síndico confirmou problema</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse flex-shrink-0 mt-1.5"></div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Amanhã 08:00</p>
                            <p className="text-sm text-orange-600 font-semibold">• Empresa HidroFix agendada</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Resolvido */}
                  {ocorrencia.status === 'resolvido' && ocorrencia.resolved_at && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-xs md:text-sm text-green-900 mb-3">
                        <strong>✅ Resolvido:</strong> Lâmpada LED substituída. Aproveitamos e trocamos outras 3 que estavam fracas. Custo: R$ 85,00.
                      </p>
                      
                      {/* Fotos Antes/Depois - IGUAL PROTÓTIPO */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="border border-green-200 rounded-lg p-2">
                          <p className="text-xs text-gray-600 mb-1">Foto Antes</p>
                          <div className="bg-gray-200 h-24 rounded flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="border border-green-200 rounded-lg p-2">
                          <p className="text-xs text-gray-600 mb-1">Foto Depois</p>
                          <div className="bg-gray-200 h-24 rounded flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-3 border-t border-gray-200">
                    <button className="flex-1 bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary-dark transition text-sm">
                      Ver Detalhes
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm">
                      Comentar
                    </button>
                  </div>
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
