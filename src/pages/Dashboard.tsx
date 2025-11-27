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

interface BannerAd {
  id: string
  image_url: string
  link_url: string
  title: string
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { profile, isAdmin } = useAuth()
  const { stats } = useDashboardStats()
  
  const [updates, setUpdates] = useState<DashboardUpdate[]>([])
  const [loadingUpdates, setLoadingUpdates] = useState(true)
  const [banner, setBanner] = useState<BannerAd | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // 1. REDIRECIONAMENTO DO SUPER ADMIN
  useEffect(() => {
    if (isAdmin) {
      // Se for Super Admin, não faz sentido ver o dashboard de morador.
      // Redireciona imediatamente para a visão macro.
      navigate('/admin', { replace: true })
    }
  }, [isAdmin, navigate])

  // 2. Carregamento de Dados
  useEffect(() => {
    if (profile?.condominio_id && !isAdmin) {
      loadUnifiedFeed()
      loadBanner()
    } else {
      setLoadingUpdates(false)
    }
  }, [profile?.condominio_id, isAdmin])

  async function loadBanner() {
    // Busca um banner ativo aleatório ou o mais recente
    try {
      const { data } = await supabase
        .from('marketplace_ads')
        .select('*')
        .eq('active', true)
        .limit(1)
        // Para randomizar, o ideal seria uma RPC 'get_random_ad', mas vamos pelo mais recente por enquanto
        .order('created_at', { ascending: false }) 
      
      if (data && data.length > 0) {
        setBanner(data[0])
        // Contar visualização (sem await para não travar a renderização)
        // CORREÇÃO: Substituído .catch por .then com verificação de erro
        supabase.rpc('increment_ad_view', { ad_id: data[0].id }).then(({ error }) => {
          if (error) console.error('Erro view banner:', error)
        })
      }
    } catch (error) {
      console.error('Erro ao carregar banner:', error)
    }
  }

  const handleBannerClick = () => {
    if (banner) {
      // Contar clique
      // CORREÇÃO: Substituído .catch por .then com verificação de erro
      supabase.rpc('increment_ad_click', { ad_id: banner.id }).then(({ error }) => {
        if (error) console.error('Erro click banner:', error)
      })
      
      if (banner.link_url) {
        window.open(banner.link_url, '_blank')
      }
    }
  }

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
          // console.warn(`Aviso: Falha ao buscar ${table}`, error.message)
          return []
        }
        return data
      } catch (err) {
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
            .is('metadata->>is_chunk', null) 
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

  if (isAdmin) return <LoadingSpinner message="Acessando painel administrativo..." />

  return (
    <div className="max-w-5xl mx-auto px-3 py-4 pb-24 md:pb-8">
      
      <div className="mb-4 px-1">
        <h2 className="text-xl font-bold text-gray-900">
          Olá, {profile?.full_name?.split(' ')[0]}! 👋
        </h2>
        <p className="text-gray-500 text-xs">
          {profile?.condominio_name ? `${profile.condominio_name}` : 'Versix Norma'}
        </p>
      </div>

      {/* GRID DE ATALHOS (3 Colunas) */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        
        {/* Card 1: Comunicados */}
        <div onClick={() => navigate('/comunicados')} className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition h-24 relative overflow-hidden">
           {stats.comunicados.nao_lidos > 0 && (<span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>)}
           <div className="text-xl mb-1">📢</div>
           <span className="text-[10px] font-bold text-gray-800 leading-tight">Avisos</span>
           {stats.comunicados.nao_lidos > 0 && <span className="text-[9px] text-red-500 font-bold">{stats.comunicados.nao_lidos} novos</span>}
        </div>

        {/* Card 2: FAQ */}
        <div onClick={() => navigate('/faq')} className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition h-24">
           <div className="text-xl mb-1">❓</div>
           <span className="text-[10px] font-bold text-gray-800 leading-tight">Dúvidas</span>
        </div>

        {/* Card 3: Transparência */}
        <div onClick={() => navigate('/transparencia')} className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition h-24">
           <div className="text-xl mb-1">💰</div>
           <span className="text-[10px] font-bold text-gray-800 leading-tight">Contas</span>
           <span className="text-[9px] text-green-600 font-bold truncate max-w-full">{formatCurrency(stats.despesas.totalMes)}</span>
        </div>

        {/* Card 4: Votações */}
        <div onClick={() => navigate('/votacoes')} className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition h-24 relative">
           {stats.votacoes.ativas > 0 && (<span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>)}
           <div className="text-xl mb-1">🗳️</div>
           <span className="text-[10px] font-bold text-gray-800 leading-tight">Votação</span>
           {stats.votacoes.ativas > 0 && <span className="text-[9px] text-purple-600 font-bold">Ativa</span>}
        </div>

        {/* Card 5: Ocorrências */}
        <div onClick={() => navigate('/ocorrencias')} className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition h-24">
           <div className="text-xl mb-1">🚨</div>
           <span className="text-[10px] font-bold text-gray-800 leading-tight">Ocorrências</span>
        </div>

        {/* Card 6: Biblioteca */}
        <div onClick={() => navigate('/biblioteca')} className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition h-24">
           <div className="text-xl mb-1">📚</div>
           <span className="text-[10px] font-bold text-gray-800 leading-tight">Documentos</span>
        </div>

      </div>

      {/* BANNER PUBLICITÁRIO (Entre os cards e o feed) */}
      {banner && (
        <div 
          onClick={handleBannerClick}
          className="mb-6 rounded-xl overflow-hidden shadow-md cursor-pointer transform transition hover:scale-[1.02]"
        >
          <img src={banner.image_url} alt={banner.title} className="w-full h-auto object-cover max-h-32 md:max-h-48" />
        </div>
      )}

      {/* FEED DE ATUALIZAÇÕES */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            ⚡ Atualizações
          </h3>
          <span className="text-[9px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
            Recentes
          </span>
        </div>
        
        {loadingUpdates ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map(i => <div key={i} className="h-12 bg-gray-50 rounded-lg"></div>)}
          </div>
        ) : (
          <div className="space-y-0">
            {updates.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-2">Nada novo por aqui.</p>
            ) : (
              updates.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => navigate(item.link)}
                  className={`
                    relative flex gap-3 p-3 transition cursor-pointer hover:bg-gray-50 rounded-lg
                    ${index !== updates.length - 1 ? 'border-b border-gray-50' : ''}
                    ${item.isPinned ? 'bg-yellow-50/50' : ''}
                  `}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm shadow-sm ${item.bgColor}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className={`text-xs font-bold truncate pr-1 ${item.color}`}>
                        {item.isPinned && <span className="mr-1 text-[8px] bg-red-100 text-red-700 px-1 rounded border border-red-200">FIXO</span>}
                        {item.title}
                      </h4>
                      <span className="text-[9px] text-gray-400 whitespace-nowrap flex-shrink-0">
                        {formatTimeAgo(item.date)}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-600 mt-0.5 line-clamp-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        <div className="mt-4 text-center">
            <button onClick={() => navigate('/comunicados')} className="text-primary text-xs font-bold hover:underline opacity-80">
              Ver mais
            </button>
        </div>
      </div>
    </div>
  )
}