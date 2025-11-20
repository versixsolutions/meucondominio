import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { formatCurrency } from '../lib/utils'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const { stats } = useDashboardStats()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadUnreadCount()
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - IGUAL AO PROTÓTIPO */}
      <header className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                🏢
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Versix Meu Condominio</h1>
                <p className="text-xs md:text-sm text-white/80">{profile?.condominio_name || 'Carregando Condomínio...'}</p>
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
              
              <div className="hidden md:flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold">
                    {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{profile?.full_name}</p>
                  <p className="text-xs text-white/80">
                    {profile?.role === 'sindico' ? '👑 Síndico' : '🏠 Morador'}
                  </p>
                </div>
              </div>
              
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

        {/* Stats Cards - IGUAL AO PROTÓTIPO */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div
            onClick={() => navigate('/faq')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-4xl">❓</div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                -65%
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">FAQ</h3>
            <p className="text-3xl font-bold text-primary-600 mb-1">{stats.faq.answeredThisMonth}</p>
            <p className="text-xs text-gray-500">perguntas respondidas</p>
          </div>

          <div
            onClick={() => navigate('/despesas')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-4xl">💰</div>
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                +12%
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Despesas</h3>
            <p className="text-2xl font-bold text-green-600 mb-1">{formatCurrency(stats.despesas.totalMes)}</p>
            <p className="text-xs text-gray-500">{stats.despesas.count} lançamentos</p>
          </div>

          <div
            onClick={() => navigate('/votacoes')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer relative"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-4xl">🗳️</div>
              {stats.votacoes.ativas > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                  {stats.votacoes.ativas}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Votações</h3>
            <p className="text-3xl font-bold text-primary-600 mb-1">{stats.votacoes.ativas}</p>
            <p className="text-xs text-gray-500">
              {stats.votacoes.ativas > 0 ? `${stats.votacoes.participation}% participação` : 'Nenhuma ativa'}
            </p>
          </div>

          <div
            onClick={() => navigate('/ocorrencias')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
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

        {/* Votação Ativa Destaque - IGUAL AO PROTÓTIPO */}
        {stats.votacoes.ativas > 0 && (
          <div
            onClick={() => navigate('/votacoes')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-xl shadow-lg mb-6 text-white cursor-pointer hover:shadow-xl transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <span className="bg-white/20 text-xs px-3 py-1 rounded-full font-bold inline-block mb-2">
                  VotaçãoAtiva
                </span>
                <h3 className="text-xl md:text-2xl font-bold mb-2">Pintura da fachada externa</h3>
                <p className="text-sm text-purple-100">Termina em 3 dias</p>
              </div>
              <button className="bg-white text-primary-600 px-6 py-2 rounded-lg font-semibold text-sm hover:bg-purple-50 transition flex-shrink-0">
                Votar Agora
              </button>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Participação</span>
                <span className="font-bold">78% (94 de 120 moradores)</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-white h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Comunicados Não Lidos */}
        {unreadCount > 0 && (
          <div
            onClick={() => navigate('/comunicados')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white mb-6 cursor-pointer hover:shadow-lg transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold inline-block mb-2">
                  🔔 NOVO
                </span>
                <h3 className="text-xl font-bold mb-2">
                  {unreadCount} Comunicado{unreadCount > 1 ? 's' : ''} Não Lido{unreadCount > 1 ? 's' : ''}
                </h3>
                <p className="text-purple-100 text-sm">
                  Confira os avisos mais recentes do síndico
                </p>
              </div>
              <div className="text-4xl">📢</div>
            </div>
          </div>
        )}

        {/* Últimas Despesas - PREVIEW COMO PROTÓTIPO */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Últimas Despesas</h3>
            <button
              onClick={() => navigate('/despesas')}
              className="text-primary-600 text-sm font-semibold hover:text-primary-700 flex items-center gap-1"
            >
              Ver todas →
            </button>
          </div>
          <div className="space-y-3">
            <div
              onClick={() => navigate('/despesas')}
              className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition cursor-pointer"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💧</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm truncate">Conta de Água - Novembro</p>
                  <p className="text-xs text-gray-500">08/11/2025</p>
                </div>
              </div>
              <span className="text-lg font-bold text-gray-900 flex-shrink-0">R$ 2.847,90</span>
            </div>

            <div
              onClick={() => navigate('/despesas')}
              className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition cursor-pointer"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⚡</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm truncate">Energia Elétrica - Novembro</p>
                  <p className="text-xs text-gray-500">05/11/2025</p>
                </div>
              </div>
              <span className="text-lg font-bold text-gray-900 flex-shrink-0">R$ 3.912,45</span>
            </div>

            <div
              onClick={() => navigate('/despesas')}
              className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition cursor-pointer"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🧹</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm truncate">Serviço de Limpeza</p>
                  <p className="text-xs text-gray-500">01/11/2025</p>
                </div>
              </div>
              <span className="text-lg font-bold text-gray-900 flex-shrink-0">R$ 1.850,00</span>
            </div>
          </div>
        </div>

        {/* Ocorrências Recentes - PREVIEW COMO PROTÓTIPO */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Ocorrências Recentes</h3>
            <button
              onClick={() => navigate('/ocorrencias')}
              className="text-primary-600 text-sm font-semibold hover:text-primary-700 flex items-center gap-1"
            >
              Ver todas →
            </button>
          </div>
          <div className="space-y-3">
            <div
              onClick={() => navigate('/ocorrencias')}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary-300 transition cursor-pointer"
            >
              <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0">
                Em andamento
              </span>
              <p className="flex-1 text-sm text-gray-700 truncate">Vazamento na piscina</p>
              <span className="text-xs text-gray-500 flex-shrink-0">Há 2 dias</span>
            </div>

            <div
              onClick={() => navigate('/ocorrencias')}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary-300 transition cursor-pointer"
            >
              <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0">
                Resolvido
              </span>
              <p className="flex-1 text-sm text-gray-700 truncate">Lâmpada queimada na portaria</p>
              <span className="text-xs text-gray-500 flex-shrink-0">Há 1 dia</span>
            </div>

            <div
              onClick={() => navigate('/ocorrencias')}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary-300 transition cursor-pointer"
            >
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0">
                Aberto
              </span>
              <p className="flex-1 text-sm text-gray-700 truncate">Portão com barulho estranho</p>
              <span className="text-xs text-gray-500 flex-shrink-0">Há 3 horas</span>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
        <div className="grid grid-cols-5 gap-1">
          <button onClick={() => navigate('/')} className="flex flex-col items-center py-2 text-primary-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Início</span>
          </button>
          <button onClick={() => navigate('/faq')} className="flex flex-col items-center py-2 text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs mt-1">FAQ</span>
          </button>
          <button onClick={() => navigate('/despesas')} className="flex flex-col items-center py-2 text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs mt-1">Despesas</span>
          </button>
          <button onClick={() => navigate('/votacoes')} className="flex flex-col items-center py-2 text-gray-600 relative">
            {stats.votacoes.ativas > 0 && (
              <span className="absolute top-1 right-1/4 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {stats.votacoes.ativas}
              </span>
            )}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span className="text-xs mt-1">Votações</span>
          </button>
          <button onClick={() => navigate('/ocorrencias')} className="flex flex-col items-center py-2 text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-xs mt-1">Alertas</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
