import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { ComunicadoWithDetails } from '../types'

export function useComunicados(typeFilter?: string) {
  const [comunicados, setComunicados] = useState<ComunicadoWithDetails[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()

  const loadComunicados = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const userId = user.id

      // Query comunicados com embedding para evitar N+1
      let query = supabase
        .from('comunicados')
        .select('*, comunicado_attachments(*), comunicado_reads(user_id)')
        .order('priority', { ascending: false })
        .order('published_at', { ascending: false })

      if (typeFilter && typeFilter !== 'all') {
        query = query.eq('type', typeFilter)
      }

      const { data: comunicadosData, error: comunicadosError } = await query

      if (comunicadosError) throw comunicadosError

      // Processar dados com anexos e status de leitura já embutidos
      const comunicadosWithDetails: ComunicadoWithDetails[] = (comunicadosData || []).map((comunicado: any) => {
        const is_read = comunicado.comunicado_reads.some((read: { user_id: string }) => read.user_id === userId)
        return {
          ...comunicado,
          attachments: comunicado.comunicado_attachments || [],
          is_read: is_read,
        }
      })

      setComunicados(comunicadosWithDetails)

      const unread = comunicadosWithDetails.filter(c => !c.is_read).length
      setUnreadCount(unread)

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido'))
    } finally {
      setLoading(false)
    }
  }, [typeFilter, user])

  useEffect(() => {
    loadComunicados()
  }, [loadComunicados])

  async function markAsRead(comunicadoId: string) {
    if (!user) return

    try {
      const { error } = await supabase
        .from('comunicado_reads')
        .insert({
          comunicado_id: comunicadoId,
          user_id: user.id, // Usar o ID real do usuário autenticado
        })

      if (error && error.code !== '23505') throw error

      setComunicados(prev =>
        prev.map(c =>
          c.id === comunicadoId ? { ...c, is_read: true } : c
        )
      )

      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Erro ao marcar como lido:', err)
    }
  }

  return { comunicados, unreadCount, loading, error, reload: loadComunicados, markAsRead }
}
