import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { formatDateTime } from '../lib/utils'
import PageLayout from '../components/PageLayout'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

interface Comunicado {
  id: string
  title: string
  content: string
  type: string
  priority: number
  published_at: string
  created_at: string
  author: {
    full_name: string
    role: string
  } | null
  is_read: boolean
}

const TYPE_CONFIG: Record<string, any> = {
  'assembleia': { label: 'Assembleia', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: '⚖️' },
  'financeiro': { label: 'Financeiro', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '💰' },
  'urgente': { label: 'Urgente', color: 'bg-red-100 text-red-800 border-red-200', icon: '🚨' },
  'informativo': { label: 'Informativo', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: 'ℹ️' },
  'importante': { label: 'Importante', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: '⚠️' },
  'geral': { label: 'Geral', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '📋' }
}

// Sub-componente para gerenciar o estado de expansão de cada card individualmente
function ComunicadoCard({ comunicado, onMarkRead }: { comunicado: Comunicado, onMarkRead: (id: string) => void }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const typeConfig = TYPE_CONFIG[comunicado.type] || TYPE_CONFIG['geral']
  const isHighPriority = comunicado.priority >= 3

  return (
    <div
      className={`
        relative bg-white rounded-xl shadow-sm border-l-4 overflow-hidden transition-all duration-300
        ${!comunicado.is_read ? 'ring-1 ring-purple-400 ring-offset-1' : ''}
        ${isExpanded ? 'shadow-md' : ''}
      `}
      style={{ borderLeftColor: isHighPriority ? '#EF4444' : '#E5E7EB' }}
    >
      {/* Badge de Novo */}
      {!comunicado.is_read && (
        <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10">
          NOVO
        </div>
      )}

      <div className="p-5">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${typeConfig.color}`}>
                {typeConfig.icon} {typeConfig.label}
              </span>
              
              <span className="text-xs text-gray-400 font-medium">
                {formatDateTime(comunicado.published_at)}
              </span>
            </div>
            
            <h3 className={`text-lg font-bold leading-tight ${!comunicado.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
              {comunicado.title}
            </h3>
          </div>
        </div>

        {/* Conteúdo com Expansão/Retração */}
        <div className={`
          prose prose-sm max-w-none text-gray-600 bg-gray-50/50 p-3 rounded-lg border border-gray-100
          ${!isExpanded ? 'line-clamp-3 relative' : ''}
        `}>
          <p className="leading-relaxed whitespace-pre-line m-0">
            {comunicado.content}
          </p>
          {/* Gradiente para indicar que tem mais texto (apenas quando fechado) */}
          {!isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
          )}
        </div>

        {/* Botão de Ver Mais */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-sm font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 transition-colors"
        >
          {isExpanded ? 'Ler menos' : 'Saiba mais...'}
        </button>

        {/* Rodapé e Ações (Só mostra se estiver expandido ou se não foi lido para economizar espaço visual inicial) */}
        <div className={`
          flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 mt-2 border-t border-gray-100
          transition-all duration-300
          ${!isExpanded && comunicado.is_read ? 'hidden' : 'flex'}
        `}>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-medium text-gray-900">
              {comunicado.author?.full_name || 'Administração'}
            </span>
            <span className="text-gray-300">•</span>
            <span className="capitalize">{comunicado.author?.role || 'Gestão'}</span>
          </div>

          {!comunicado.is_read ? (
            <button
              onClick={() => onMarkRead(comunicado.id)}
              className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-purple-700 transition shadow-sm flex items-center justify-center gap-2"
            >
              <span>✓</span> Marcar lido
            </button>
          ) : (
            <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Lido
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Comunicados() {
  const [comunicados, setComunicados] = useState<Comunicado[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    loadComunicados()
  }, [user])

  async function loadComunicados() {
    try {
      const { data: comunicadosData, error: comunicadosError } = await supabase
        .from('comunicados')
        .select(`
          id,
          title,
          content,
          type,
          priority,
          published_at,
          created_at,
          author:author_id (full_name, role)
        `)
        .order('priority', { ascending: false })
        .order('published_at', { ascending: false })

      if (comunicadosError) throw comunicadosError

      const { data: readsData, error: readsError } = await supabase
        .from('comunicado_reads')
        .select('comunicado_id')
        .eq('user_id', user?.id || '')

      if (readsError) throw readsError

      const readIds = new Set(readsData?.map(r => r.comunicado_id) || [])

      const formattedData = comunicadosData?.map(c => ({
        ...c,
        author: Array.isArray(c.author) ? c.author[0] : c.author,
        is_read: readIds.has(c.id),
        published_at: c.published_at || c.created_at
      })) || []

      setComunicados(formattedData)
    } catch (error) {
      console.error('Erro ao carregar comunicados:', error)
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(comunicadoId: string) {
    try {
      if (!user) return
      const { error } = await supabase
        .from('comunicado_reads')
        .insert({ comunicado_id: comunicadoId, user_id: user.id })

      if (error) throw error

      setComunicados(prev =>
        prev.map(c => c.id === comunicadoId ? { ...c, is_read: true } : c)
      )
    } catch (error) {
      console.error('Erro ao marcar como lido:', error)
    }
  }

  const filteredComunicados = selectedType 
    ? comunicados.filter(c => c.type === selectedType)
    : comunicados

  const unreadCount = comunicados.filter(c => !c.is_read).length

  if (loading) return <LoadingSpinner message="Carregando avisos..." />

  return (
    <PageLayout
      title="Quadro de Avisos"
      subtitle="Fique por dentro de tudo que acontece no condomínio"
      icon="📢"
      headerAction={
        unreadCount > 0 ? (
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full inline-block border border-white/30 shadow-sm">
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></span>
              {unreadCount} não lidos
            </p>
          </div>
        ) : null
      }
    >
      {/* Filtros com Rolagem Horizontal (Scroll Snap) */}
      <div className="relative mb-6 -mx-4 px-4">
        <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
          <button
            onClick={() => setSelectedType(null)}
            className={`snap-start shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition border ${
              !selectedType
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Todos
          </button>
          {Object.entries(TYPE_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedType(key)}
              className={`snap-start shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition border flex items-center gap-1 ${
                selectedType === key
                  ? `${config.color} border-transparent shadow-sm ring-1 ring-offset-1`
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>{config.icon}</span> {config.label}
            </button>
          ))}
        </div>
        {/* Gradiente lateral para indicar rolagem */}
        <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none md:hidden" />
      </div>

      {/* Lista de Comunicados */}
      {filteredComunicados.length > 0 ? (
        <div className="space-y-4">
          {filteredComunicados.map((comunicado) => (
            <ComunicadoCard 
              key={comunicado.id} 
              comunicado={comunicado} 
              onMarkRead={markAsRead} 
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="📭"
          title="Nenhum comunicado"
          description="Não há avisos para esta categoria no momento."
          action={{
            label: 'Ver todos',
            onClick: () => setSelectedType(null)
          }}
        />
      )}
    </PageLayout>
  )
}