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
  priority: string
  created_at: string
  author: {
    full_name: string
    role: string
  }
  is_read: boolean
}

const PRIORITY_CONFIG = {
  baixa: { label: 'Baixa', color: 'bg-gray-100 text-gray-700', icon: '📌' },
  normal: { label: 'Normal', color: 'bg-blue-100 text-blue-700', icon: '📋' },
  alta: { label: 'Alta', color: 'bg-orange-100 text-orange-700', icon: '⚠️' },
  urgente: { label: 'Urgente', color: 'bg-red-100 text-red-700', icon: '🚨' },
}

export default function Comunicados() {
  const [comunicados, setComunicados] = useState<Comunicado[]>([])
  const [loading, setLoading] = useState(true)
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
          priority,
          created_at,
          author:author_id (
            full_name,
            role
          )
        `)
        .order('created_at', { ascending: false })

      if (comunicadosError) throw comunicadosError

      const { data: readsData, error: readsError } = await supabase
        .from('comunicado_reads')
        .select('comunicado_id')
        .eq('user_id', user?.id || '')

      if (readsError) throw readsError

      const readIds = new Set(readsData?.map(r => r.comunicado_id) || [])

      const comunicadosWithReadStatus = comunicadosData?.map(c => ({
        ...c,
        author: Array.isArray(c.author) ? c.author[0] : c.author,
        is_read: readIds.has(c.id),
      })) || []

      setComunicados(comunicadosWithReadStatus)
    } catch (error) {
      console.error('Erro ao carregar comunicados:', error)
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(comunicadoId: string) {
    try {
      await supabase
        .from('comunicado_reads')
        .insert({
          comunicado_id: comunicadoId,
          user_id: user?.id,
        })

      setComunicados(prev =>
        prev.map(c =>
          c.id === comunicadoId ? { ...c, is_read: true } : c
        )
      )
    } catch (error) {
      console.error('Erro ao marcar como lido:', error)
    }
  }

  const unreadCount = comunicados.filter(c => !c.is_read).length

  if (loading) return <LoadingSpinner message="Carregando comunicados..." />

  return (
    <PageLayout
      title="Comunicados"
      subtitle="Avisos importantes do condomínio"
      icon="📢"
      headerAction={
        unreadCount > 0 ? (
          <div className="bg-white/20 px-4 py-2 rounded-lg inline-block">
            <p className="text-sm font-semibold">
              {unreadCount} não {unreadCount === 1 ? 'lido' : 'lidos'}
            </p>
          </div>
        ) : null
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">{comunicados.length}</p>
          <p className="text-sm text-gray-600">Total</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{unreadCount}</p>
          <p className="text-sm text-gray-600">Não lidos</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold text-green-600">
            {comunicados.length - unreadCount}
          </p>
          <p className="text-sm text-gray-600">Lidos</p>
        </div>
      </div>

      {/* Lista */}
      {comunicados.length > 0 ? (
        <div className="space-y-4">
          {comunicados.map((comunicado) => {
            const priorityConfig = PRIORITY_CONFIG[comunicado.priority as keyof typeof PRIORITY_CONFIG]
            return (
              <div
                key={comunicado.id}
                className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition hover:shadow-md ${
                  !comunicado.is_read ? 'border-purple-300' : 'border-gray-200'
                }`}
              >
                <div className="p-5 md:p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${priorityConfig.color}`}>
                          {priorityConfig.icon} {priorityConfig.label}
                        </span>
                        {!comunicado.is_read && (
                          <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">
                            NOVO
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-gray-900">{comunicado.title}</h3>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 whitespace-pre-line text-sm md:text-base">{comunicado.content}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                      <span>
                        {comunicado.author?.role === 'sindico' ? '👑' : '��'}{' '}
                        {comunicado.author?.full_name || 'Administração'}
                      </span>
                      <span>•</span>
                      <span>{formatDateTime(comunicado.created_at)}</span>
                    </div>

                    {!comunicado.is_read && (
                      <button
                        onClick={() => markAsRead(comunicado.id)}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition"
                      >
                        Marcar como lido
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon="📭"
          title="Nenhum comunicado"
          description="Não há comunicados no momento. Fique tranquilo!"
        />
      )}
    </PageLayout>
  )
}
