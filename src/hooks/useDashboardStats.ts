import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface DashboardStats {
  faq: { answeredThisMonth: number }
  despesas: { totalMes: number; count: number }
  votacoes: { ativas: number; participation: number }
  ocorrencias: { abertas: number; em_andamento: number }
}

const INITIAL_STATS: DashboardStats = {
  faq: { answeredThisMonth: 0 },
  despesas: { totalMes: 0, count: 0 },
  votacoes: { ativas: 0, participation: 0 },
  ocorrencias: { abertas: 0, em_andamento: 0 }
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>(INITIAL_STATS)
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()

  useEffect(() => {
    if (profile?.condominio_id) {
      loadStats()
    }
  }, [profile?.condominio_id])

  async function loadStats() {
    try {
      setLoading(true)
      
      // 1. Despesas do Mês Atual
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      
      const { data: despesas } = await supabase
        .from('despesas')
        .select('amount')
        .gte('due_date', startOfMonth.toISOString())
        // Se quiser filtrar pelo condomínio do usuário, precisaria de um join ou RLS configurado
        // Assumindo que o RLS já filtra pelo tenant do usuário:
      
      const totalDespesas = despesas?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0

      // 2. Votações Ativas
      const now = new Date().toISOString()
      const { data: votacoes } = await supabase
        .from('votacoes')
        .select('id')
        .gt('end_date', now) // Data de fim maior que agora
      
      // 3. Ocorrências por Status
      const { data: ocorrencias } = await supabase
        .from('ocorrencias')
        .select('status')
        .in('status', ['aberto', 'em_andamento'])

      const abertas = ocorrencias?.filter(o => o.status === 'aberto').length || 0
      const emAndamento = ocorrencias?.filter(o => o.status === 'em_andamento').length || 0

      // 4. FAQs (Total)
      const { count: faqCount } = await supabase
        .from('faqs')
        .select('*', { count: 'exact', head: true })

      setStats({
        faq: { answeredThisMonth: faqCount || 0 },
        despesas: { 
          totalMes: totalDespesas, 
          count: despesas?.length || 0 
        },
        votacoes: { 
          ativas: votacoes?.length || 0, 
          participation: 0 // Cálculo de participação requer query mais complexa de votos
        },
        ocorrencias: { 
          abertas, 
          em_andamento: emAndamento 
        }
      })

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  return { stats, loading, reload: loadStats }
}