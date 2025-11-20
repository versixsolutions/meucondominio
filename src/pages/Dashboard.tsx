import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { formatCurrency } from '../lib/utils'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Despesa, Ocorrencia } from '../types'

export default function Dashboard() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const { stats } = useDashboardStats()
  const [unreadCount, setUnreadCount] = useState(0)
  
  // Novos estados para listas dinâmicas
  const [recentDespesas, setRecentDespesas] = useState<Despesa[]>([])
  const [recentOcorrencias, setRecentOcorrencias] = useState<Ocorrencia[]>([])

  useEffect(() => {
    loadUnreadCount()
    loadRecentData()
  }, [])

  async function loadUnreadCount() {
    try {
      const { data: comunicados } = await supabase.from('comunicados').select('id')
      const { data: reads } = await supabase
        .from('comunicado_reads')
        .select('comunicado_id')
        .eq('user_id', profile?.id || '')

      const readIds = new Set(reads?.map(r => r.comunicado_id) || [])
      const unread = comunicados?.filter(c => !readIds.has(c.id)).length || 0
      setUnreadCount(unread)
    } catch (error) {
      console.error('Erro ao carregar não lidos:', error)
    }
  }

  async function loadRecentData() {
    try {
      // Carregar 3 últimas despesas
      const { data: despesas } = await supabase
        .from('despesas')
        .select('*') // Retorna description, amount, category, due_date
        .order('due_date', { ascending: false })
        .limit(3)
      
      if (despesas) setRecentDespesas(despesas)

      // Carregar 3 últimas ocorrências
      const { data: ocorrencias } = await supabase
        .from('ocorrencias')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3)

      if (ocorrencias) setRecentOcorrencias(ocorrencias)

    } catch (error) {
      console.error('Erro ao carregar dados recentes:', error)
    }
  }

  // Helper simples para ícones de categoria (já que agora é texto livre no banco)
  function getCategoryIcon(category: string | null) {
    const cat = category?.toLowerCase() || ''
    if (cat.includes('água') || cat.includes('agua')) return '💧'
    if (cat.includes('luz') || cat.includes('energia')) return '⚡'
    if (cat.includes('limpeza') || cat.includes('serviço')) return '🧹'
    if (cat.includes('manutenção')) return '🔧'
    return '📝'
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'aberto': return 'bg-blue-100 text-blue-600'
      case 'em_andamento': return 'bg-orange-100 text-orange-600'
      case 'resolvido': return 'bg-green-100 text-green-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  function formatStatus(status: string) {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                🏢
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Versix Meu Condominio</h1>
                <p className="text-xs md:text-sm text-white/80">{profile?.condominio_name || 'Carregando...'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/comunicados')}
                className="relative p-2 hover:bg-white/20 rounded-lg transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={signOut}
                className="hidden md:block bg-white/20 px-4 py-2 rounded-lg text-sm hover:bg-white/30 transition"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 pb-24 md:pb-6">
        {/* Saudação */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            Olá, {profile?.full_name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-600">Bem-vindo ao seu painel de gestão condominial</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div onClick={() => navigate('/faq')} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="text-4xl">❓</div>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">FAQ</h3>
            <p className="text-3xl font-bold text-primary mb-1">{stats.faq.answeredThisMonth}</p>
            <p className="text-xs text-gray-500">perguntas respondidas</p>
          </div>

          <div onClick={() => navigate('/despesas')} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="text-4xl">💰</div>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Despesas</h3>
            <p className="text-2xl font-bold text-green-600 mb-1">{formatCurrency(stats.despesas.totalMes)}</p>
            <p className="text-xs text-gray-500">{stats.despesas.count} lançamentos no mês</p>
          </div>

          <div onClick={() => navigate('/votacoes')} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg cursor-pointer relative">
            <div className="flex items-center justify-between mb-3">
              <div className="text-4xl">🗳️</div>
              {stats.votacoes.ativas > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                  {stats.votacoes.ativas}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Votações</h3>
            <p className="text-3xl font-bold text-primary mb-1">{stats.votacoes.ativas}</p>
            <p className="text-xs text-gray-500">
              {stats.votacoes.ativas > 0 ? 'Votações ativas' : 'Nenhuma ativa'}
            </p>
          </div>

          <div onClick={() => navigate('/ocorrencias')} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="text-4xl">🚨</div>
              {(stats.ocorrencias.abertas + stats.ocorrencias.em_andamento) > 0 && (
                <span className="bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {stats.ocorrencias.abertas + stats.ocorrencias.em_andamento}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Ocorrências</h3>
            <p className="text-3xl font-bold text-orange-600 mb-1">
              {stats.ocorrencias.abertas + stats.ocorrencias.em_andamento}
            </p>
            <p className="text-xs text-gray-500">{stats.ocorrencias.abertas} abertas</p>
          </div>
        </div>

        {/* ÚLTIMAS DESPESAS (AGORA DINÂMICO) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Últimas Despesas</h3>
            <button
              onClick={() => navigate('/despesas')}
              className="text-primary text-sm font-semibold hover:text-primary-dark flex items-center gap-1"
            >
              Ver todas →
            </button>
          </div>
          
          <div className="space-y-3">
            {recentDespesas.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Nenhuma despesa registrada.</p>
            ) : (
              recentDespesas.map((despesa) => (
                <div
                  key={despesa.id}
                  onClick={() => navigate('/despesas')}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 border border-blue-100">
                      <span className="text-2xl">{getCategoryIcon(despesa.category)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      {/* AQUI: description em vez de title */}
                      <p className="font-semibold text-gray-900 text-sm truncate capitalize">
                        {despesa.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        Vence em: {new Date(despesa.due_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-900 flex-shrink-0">
                    {formatCurrency(despesa.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* OCORRÊNCIAS RECENTES (AGORA DINÂMICO) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Ocorrências Recentes</h3>
            <button
              onClick={() => navigate('/ocorrencias')}
              className="text-primary text-sm font-semibold hover:text-primary-dark flex items-center gap-1"
            >
              Ver todas →
            </button>
          </div>
          
          <div className="space-y-3">
            {recentOcorrencias.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Nenhuma ocorrência registrada.</p>
            ) : (
              recentOcorrencias.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate('/ocorrencias')}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary transition cursor-pointer"
                >
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${getStatusColor(item.status)}`}>
                    {formatStatus(item.status)}
                  </span>
                  <p className="flex-1 text-sm text-gray-700 truncate font-medium">{item.title}</p>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {new Date(item.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Mobile Menu (Mantido Igual, apenas ajustando nomes de rotas se necessário) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50 safe-area-pb">
        <div className="grid grid-cols-5 gap-1">
          <button onClick={() => navigate('/')} className="flex flex-col items-center py-3 text-primary">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </button>
          <button onClick={() => navigate('/faq')} className="flex flex-col items-center py-3 text-gray-400 hover:text-primary transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
          <button onClick={() => navigate('/despesas')} className="flex flex-col items-center py-3 text-gray-400 hover:text-primary transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
          <button onClick={() => navigate('/votacoes')} className="flex flex-col items-center py-3 text-gray-400 hover:text-primary transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          </button>
          <button onClick={() => navigate('/ocorrencias')} className="flex flex-col items-center py-3 text-gray-400 hover:text-primary transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </button>
        </div>
      </nav>
    </div>
  )
}