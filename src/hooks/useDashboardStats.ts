import { useState, useEffect } from 'react'

interface DashboardStats {
  faq: {
    total: number
    answeredThisMonth: number
  }
  despesas: {
    totalMes: number
    count: number
  }
  votacoes: {
    ativas: number
    participation: number
  }
  ocorrencias: {
    abertas: number
    em_andamento: number
  }
  comunicados: {
    nao_lidos: number
    total: number
  }
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    faq: { total: 45, answeredThisMonth: 73 },
    despesas: { totalMes: 12438.90, count: 15 },
    votacoes: { ativas: 1, participation: 78 },
    ocorrencias: { abertas: 3, em_andamento: 2 },
    comunicados: { nao_lidos: 2, total: 8 },
  })
  
  const [loading, setLoading] = useState(false)

  // Por enquanto retorna dados mock
  // Depois vamos buscar do Supabase

  return { stats, loading, reload: () => {} }
}
