import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { formatCurrency } from '../lib/utils'
import { supabase } from '../lib/supabase'
import LoadingSpinner from '../components/LoadingSpinner'

// Interface unificada para o feed de atualizações
interface DashboardUpdate {
  id: string
  type: 'comunicado' | 'despesa' | 'ocorrencia' | 'votacao' | 'faq' | 'documento'
  title: string
  description: string
  date: string
  icon: string
  color: string
  bgColor: string
  link: string
  isPinned?: boolean
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { profile, isAdmin } = useAuth()
  const { stats } = useDashboardStats()
  
  const [updates, setUpdates] = useState<DashboardUpdate[]>([])
  const [loadingUpdates, setLoadingUpdates] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // 1. REDIRECIONAMENTO DO SUPER ADMIN
  useEffect(() => {
    if (isAdmin) {
      // Se for Super Admin, não faz sentido ver o dashboard de morador.
      // Redireciona imediatamente para a visão macro.
      navigate('/admin', { replace: true })
    }
  }, [isAdmin, navigate])

  // 2. Carregamento do Feed (Apenas se NÃO for admin, para economizar recurso)
  useEffect(() => {
    if (profile?.condominio_id && !isAdmin) {
      loadUnifiedFeed()
    } else {
      setLoadingUpdates(false)
    }
  }, [profile?.condominio_id, isAdmin])

  const scrollCards = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 220
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  async function loadUnifiedFeed() {
    setLoadingUpdates(true)
    
    const fetchData = async (table: string, queryBuilder: any) => {
      try {
        const { data, error } = await queryBuilder
        if (error) {
          console.warn(`Aviso: Falha ao buscar ${table}`, error.message)
          return []
        }
        return data
      } catch (err) {
        console.warn(`Exceção ao buscar ${table}`, err)
        return []
      }
    }

    try {
      const [comunicados, despesas, ocorrencias, votacoes, faqs, documentos] = await Promise.all([
        fetchData('comunicados', 
          supabase.from('comunicados')
            .select('*')
            .eq('condominio_id', profile?.condominio_id)
            .order('published_at', { ascending: false })
            .limit(5)
        ),
        fetchData('despesas', 
          supabase.from('despesas')
            .select('*')
            .eq('condominio_id', profile?.condominio_id)
            .order('created_at', { ascending: false })
            .limit(5)
        ),
        fetchData('ocorrencias', 
          supabase.from('ocorrencias')
            .select('*')
            .eq('condominio_id', profile?.condominio_id)
            .order('created_at', { ascending: false })
            .limit(5)
        ),
        fetchData('votacoes', 
          supabase.from('votacoes')
            .select('*')
            .eq('condominio_id', profile?.condominio_id)
            .order('created_at', { ascending: false })
            .limit(3)
        ),
        fetchData('faqs', 
          supabase.from('faqs')
            .select('*')
            .eq('condominio_id', profile?.condominio_id)
            .order('created_at', { ascending: false })
            .limit(3)
        ),
        fetchData('documents',
          supabase.from('documents')
            .select('id, title, created_at, metadata')
            .eq('condominio_id', profile?.condominio_id)
            .is('metadata->>is_chunk', null) // Apenas documentos pai
            .order('created_at', { ascending: false })
            .limit(5)
        )
      ])

      const newUpdates: DashboardUpdate[] = []

      comunicados?.forEach((c: any) => {
        if (c.title.startsWith('Novo Documento:')) return;
        const isUrgent = c.priority >= 3
        newUpdates.push({
          id: `com-${c.id}`,
          type: 'comunicado',
          title: isUrgent ? `URGENTE: ${c.title}` : c.title,
          description: c.content,
          date: c.published_at || c.created_at, 
          icon: isUrgent ? '📢' : '📌',
          color: isUrgent ? 'text-red-600' : 'text-blue-600',
          bgColor: isUrgent ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-100',
          link: '/comunicados',
          isPinned: isUrgent
        })
      })

      documentos?.forEach((d: any) => {
        newUpdates.push({
          id: `doc-${d.id}`,
          type: 'documento',
          title: d.title || d.metadata?.title || 'Novo Documento',
          description: `Adicionado à Biblioteca (${d.metadata?.category || 'Geral'})`,
          date: d.created_at,
          icon: '📂',
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50 border-indigo-100',
          link: '/biblioteca'
        })
      })

      despesas?.forEach((d: any) => {
        newUpdates.push({
          id: `desp-${d.id}`,
          type: 'despesa',
          title: 'Nova Despesa',
          description: `${d.description} - ${formatCurrency(d.amount)}`,
          date: d.created_at,
          icon: '💰',
          color: 'text-green-600',
          bgColor: 'bg-white border-gray-100',
          link: '/transparencia'
        })
      })

      ocorrencias?.forEach((o: any) => {
        newUpdates.push({
          id: `oco-${o.id}`,
          type: 'ocorrencia',
          title: `Ocorrência: ${o.status}`,
          description: o.title,
          date: o.created_at,
          icon: '🚨',
          color: 'text-orange-600',
          bgColor: 'bg-white border-gray-100',
          link: '/ocorrencias'
        })
      })

      votacoes?.forEach((v: any) => {
        const isActive = new Date(v.end_date) > new Date()
        newUpdates.push({
          id: `vot-${v.id}`,
          type: 'votacao',
          title: isActive ? 'Nova Assembleia' : 'Votação Encerrada',
          description: v.title,
          date: v.created_at,
          icon: '🗳️',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50 border-purple-100',
          link: '/votacoes'
        })
      })

      faqs?.forEach((f: any) => {
        newUpdates.push({
          id: `faq-${f.id}`,
          type: 'faq',
          title: 'Dúvida Respondida',
          description: f.question,
          date: f.created_at,
          icon: '❓',
          color: 'text-cyan-600',
          bgColor: 'bg-white border-gray-100',
          link: '/faq'
        })
      })

      const sorted = newUpdates.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })

      setUpdates(sorted.slice(0, 20))
    } catch (error) {
      console.error("Erro geral no dashboard:", error)
    } finally {
      setLoadingUpdates(false)
    }
  }

  function formatTimeAgo(dateString: string) {
    if (!dateString) return ''
    const diff = new Date().getTime() - new Date(dateString).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `há ${days}d`
    if (hours > 0) return `há ${hours}h`
    if (minutes > 0) return `há ${minutes}m`
    return 'agora'
  }

  // Se for admin, exibe loading ou nada enquanto redireciona
  if (isAdmin) return <LoadingSpinner message="Acessando painel administrativo..." />

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          Olá, {profile?.full_name?.split(' ')[0]}! 👋
        </h2>
        <p className="text-gray-600 text-sm">
          {profile?.condominio_name ? `${profile.condominio_name}` : 'Bem-vindo ao Versix Norma'}
        </p>
      </div>

      {/* Container de Cards Stat (Atalhos Rápidos) */}
      <div className="relative group mb-8">
        <button onClick={() => scrollCards('left')} className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-20 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg text-gray-600 hover:text-primary hidden md:flex items-center justify-center hover:scale-110 transition border border-gray-100 opacity-0 group-hover:opacity-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={() => scrollCards('right')} className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-20 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg text-gray-600 hover:text-primary hidden md:flex items-center justify-center hover:scale-110 transition border border-gray-100 opacity-0 group-hover:opacity-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
        <div ref={scrollContainerRef} className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-3 pb-4 scrollbar-hide scroll-smooth">
          <div onClick={() => navigate('/comunicados')} className="min-w-[200px] md:min-w-[220px] snap-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg cursor-pointer transition-transform hover:-translate-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2"><div className="text-3xl">📢</div>{stats.comunicados.nao_lidos > 0 && (<span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-sm">{stats.comunicados.nao_lidos} NOVOS</span>)}</div>
            <h3 className="text-sm font-bold text-gray-900 mb-0.5">Comunicados</h3><p className="text-xs text-gray-500">Mural de avisos</p>
          </div>
          <div onClick={() => navigate('/faq')} className="min-w-[200px] md:min-w-[220px] snap-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg cursor-pointer transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2"><div className="text-3xl">❓</div></div>
            <h3 className="text-sm font-bold text-gray-900 mb-0.5">FAQ</h3><p className="text-2xl font-bold text-primary mb-0.5">{stats.faq.answeredThisMonth}</p><p className="text-[10px] text-gray-400 uppercase font-semibold">Dúvidas respondidas</p>
          </div>
          <div onClick={() => navigate('/transparencia')} className="min-w-[200px] md:min-w-[220px] snap-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg cursor-pointer transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2"><div className="text-3xl">💰</div></div>
            <h3 className="text-sm font-bold text-gray-900 mb-0.5">Transparência</h3><p className="text-xl font-bold text-green-600 mb-0.5">{formatCurrency(stats.despesas.totalMes)}</p><p className="text-[10px] text-gray-400 uppercase font-semibold truncate">Em {stats.despesas.monthLabel}</p>
          </div>
          <div onClick={() => navigate('/votacoes')} className="min-w-[200px] md:min-w-[220px] snap-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg cursor-pointer relative transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2"><div className="text-3xl">🗳️</div>{stats.votacoes.ativas > 0 && (<span className="bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">ATIVAS</span>)}</div>
            <h3 className="text-sm font-bold text-gray-900 mb-0.5">Assembleia Digital</h3><p className="text-2xl font-bold text-primary mb-0.5">{stats.votacoes.ativas}</p><p className="text-[10px] text-gray-400 uppercase font-semibold">Em andamento</p>
          </div>
          <div onClick={() => navigate('/ocorrencias')} className="min-w-[200px] md:min-w-[220px] snap-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg cursor-pointer transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2"><div className="text-3xl">🚨</div>{(stats.ocorrencias.abertas + stats.ocorrencias.em_andamento) > 0 && (<span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{stats.ocorrencias.abertas + stats.ocorrencias.em_andamento}</span>)}</div>
            <h3 className="text-sm font-bold text-gray-900 mb-0.5">Ocorrências</h3><p className="text-xl font-bold text-orange-600 mb-0.5">{stats.ocorrencias.abertas}</p><p className="text-[10px] text-gray-400 uppercase font-semibold">Abertas agora</p>
          </div>
        </div>
      </div>

      {/* Feed de Atualizações */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
            ⚡ Atualizações
          </h3>
          <span className="text-[10px] md:text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-medium">
            Tempo real
          </span>
        </div>
        
        {loadingUpdates ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-50 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            {updates.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Nenhuma atualização recente.</p>
            ) : (
              updates.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => navigate(item.link)}
                  className={`
                    relative flex gap-3 md:gap-4 p-3 md:p-4 transition cursor-pointer hover:bg-gray-50 rounded-lg
                    ${index !== updates.length - 1 ? 'border-b border-gray-50 md:border-gray-100' : ''}
                    ${item.isPinned ? 'bg-yellow-50/50 hover:bg-yellow-50' : ''}
                  `}
                >
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-lg md:text-xl shadow-sm ${item.bgColor}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className={`text-sm font-bold truncate pr-2 ${item.color}`}>
                        {item.isPinned && <span className="mr-1.5 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded uppercase tracking-wide border border-red-200">Fixo</span>}
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
                        {formatTimeAgo(item.date)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        <div className="mt-6 text-center">
            <button onClick={() => navigate('/comunicados')} className="text-primary text-xs md:text-sm font-semibold hover:underline opacity-80 hover:opacity-100 transition">
              Ver todos os comunicados &rarr;
            </button>
        </div>
      </div>
    </div>
  )
}