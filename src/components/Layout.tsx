import { useState } from 'react'
import Tooltip from './ui/Tooltip'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { useTheme } from '../contexts/ThemeContext'
import { useKeyboardShortcuts } from '../hooks/useKeyboardNavigation'
import LoadingSpinner from './LoadingSpinner'
import Chatbot from './Chatbot'
import SkipLinks from './SkipLinks'
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp'

interface NavItem {
  path: string
  label: string
  icon: string
  badge?: number
  adminOnly?: boolean
  isSpecial?: boolean // Nova propriedade para identificar o botão da Norma
  action?: () => void // Ação para botões especiais
}

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const { profile, signOut, canManage } = useAuth()
  const { stats } = useDashboardStats()
  const { theme, loading } = useTheme()
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  // Estado global do Chatbot no Layout
  const [isChatOpen, setIsChatOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  // Menu Desktop (Mantido conforme original ou ajustado levemente se necessário, mas focado no mobile)
  const desktopNavItems: NavItem[] = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/comunicacao', label: 'Comunicação', icon: '📢' },
    { path: '/suporte', label: 'Suporte', icon: '🤝' },
    { path: '/transparencia', label: 'Transparência', icon: '💰' },
    { path: '/perfil', label: 'Perfil', icon: '👤' },
  ]

  // Menu Mobile (Atualizado conforme solicitado)
  const mobileNavItems: NavItem[] = [
    { path: '/', label: 'Início', icon: '🏠' },
    { path: '/suporte', label: 'Suporte', icon: '🤝' },
    // Item Especial da Norma
    { 
      path: '#chat', 
      label: 'Norma', 
      icon: 'N', 
      isSpecial: true,
      action: () => setIsChatOpen(true) 
    },
    { path: '/transparencia', label: 'Transparência', icon: '💰' },
    { path: '/perfil', label: 'Perfil', icon: '👤' },
  ]

  const visibleDesktopItems = desktopNavItems.filter(item => !item.adminOnly || canManage)
  const visibleMobileItems = mobileNavItems.filter(item => !item.adminOnly || canManage)

  // Atalhos de teclado
  useKeyboardShortcuts({
    '1': () => navigate('/'),
    's': () => navigate('/suporte'),
    't': () => navigate('/transparencia'),
    'p': () => navigate('/perfil'),
    'n': () => setIsChatOpen(true),
  })

  async function handleLogout() {
    if (confirm('Tem certeza que deseja sair?')) {
      await signOut()
      navigate('/login')
    }
  }

  if (loading) return <LoadingSpinner message="Carregando..." />

  function prefetchRoute(path: string) {
    switch (path) {
      case '/':
        import('../pages/Dashboard');
        break;
      case '/comunicacao':
        import('../pages/Comunicacao');
        break;
      case '/suporte':
        import('../pages/Suporte');
        break;
      case '/transparencia':
        import('../pages/Transparencia');
        break;
      case '/perfil':
        import('../pages/Profile');
        break;
      default:
        break;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <SkipLinks />
      
      {/* Header */}
      <header 
        id="navigation"
        className="text-white shadow-lg sticky top-0 z-40 transition-all duration-500"
        style={{ background: theme.gradients.header }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="hidden md:flex p-2 rounded-lg hover:bg-white/20 transition"
                aria-label="Abrir menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <Link to="/" className="flex items-center gap-3 group">
                <img 
                  src={theme.branding.logoUrl} 
                  alt="Versix Norma" 
                  className="h-10 w-auto bg-white rounded-md p-1 shadow-sm object-contain"
                />
                <div>
                  <h1 className="text-lg md:text-xl font-bold tracking-tight leading-tight">
                    {profile?.condominio_name || 'Versix Norma'}
                  </h1>
                  {canManage && (
                    <span className="bg-white/20 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-white/30 inline-block">
                      {profile?.role === 'admin' ? 'Super Admin' : 'Gestor'}
                    </span>
                  )}
                </div>
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {canManage && (
                <Link 
                  to="/admin" 
                  onMouseEnter={() => { import('../pages/admin/AdminDashboard') }}
                  className="bg-white text-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 transition shadow-sm flex items-center gap-2 mr-2 animate-fade-in"
                >
                  <span>⚙️</span> Painel Admin
                </Link>
              )}

              <Link to="/perfil" className="text-right hover:opacity-80 transition">
                <p className="text-sm font-bold leading-tight">{profile?.full_name?.split(' ')[0]}</p>
                <p className="text-[10px] uppercase tracking-wider opacity-80 font-semibold">
                  Unid: {profile?.unit_number || '-'}
                </p>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-white/20 rounded-lg transition duration-200"
                title="Sair"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* SIDEBAR (Drawer) - Desktop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 md:block hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:block hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-gray-800">Menu</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {canManage && (
            <div className="mb-4">
              <Link 
                to="/admin"
                onClick={() => setIsSidebarOpen(false)}
                className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white px-4 py-3 rounded-xl text-sm font-bold shadow-md flex items-center justify-center gap-2 hover:shadow-lg transition transform hover:scale-[1.02]"
              >
                <span>⚙️</span> Acessar Painel Admin
              </Link>
            </div>
          )}

          <nav className="flex-1 space-y-2">
            {visibleDesktopItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onMouseEnter={() => prefetchRoute(item.path)}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition duration-200 ${
                  isActive(item.path) 
                    ? 'bg-gray-100 text-primary font-bold' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                   <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full px-2 py-0.5">
                     {item.badge}
                   </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="pt-6 border-t border-gray-100 mt-auto">
            <button 
              onClick={() => { setIsSidebarOpen(false); handleLogout(); }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe safe-area-pb">
        {/* Botão Admin Flutuante (Reposicionado ou removido se interferir com a Norma, mas mantido por segurança no topo) */}
          {canManage && (
          <Link 
            to="/admin" 
            onMouseEnter={() => { import('../pages/admin/AdminDashboard') }}
            className="absolute -top-16 right-4 bg-slate-900 text-white p-2.5 rounded-full shadow-lg flex items-center justify-center hover:bg-slate-800 transition transform hover:scale-110 z-50"
            title="Painel Admin"
          >
            ⚙️
          </Link>
        )}

        <div className="grid grid-cols-5 gap-1 p-1 h-16 items-end">
          {visibleMobileItems.map((item) => {
            const active = isActive(item.path)
            
            // RENDERIZAÇÃO DO BOTÃO ESPECIAL "NORMA"
            if (item.isSpecial) {
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  data-tour="chatbot-button"
                  className="relative flex flex-col items-center justify-end pb-1 group -mt-8"
                >
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-white transform transition-transform active:scale-95"
                    style={{ background: theme.colors.primary.DEFAULT }}
                  >
                    <span className="text-white text-2xl font-serif font-bold italic drop-shadow-md">
                      {item.icon}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold mt-1" style={{ color: theme.colors.primary.DEFAULT }}>
                    {item.label}
                  </span>
                </button>
              )
            }

            // RENDERIZAÇÃO DOS BOTÕES NORMAIS
            return (
              <Tooltip content={item.label} side="top" delayDuration={300}>
                <Link
                  key={item.path}
                  to={item.path}
                  onMouseEnter={() => prefetchRoute(item.path)}
                  data-tour={item.path === '/suporte' ? 'suporte-menu' : item.path === '/transparencia' ? 'transparency' : undefined}
                  className="relative flex flex-col items-center justify-center py-2 rounded-lg transition duration-200 h-full"
                  style={{ 
                    color: active ? theme.colors.primary.DEFAULT : theme.colors.text.secondary,
                  }}
                  aria-label={`Ir para ${item.label}`}
                >
                  <span className={`text-xl mb-0.5 ${active ? 'scale-110' : ''} transition-transform`}>{item.icon}</span>
                  <span className={`text-[9px] font-medium truncate w-full text-center ${active ? 'font-bold' : ''}`}>
                    {item.label}
                  </span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute top-1 right-2 bg-red-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center border border-white">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </Link>
              </Tooltip>
            )
          })}
        </div>
      </nav>

      {/* Componente Chatbot Global */}
      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      
      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp />

      {/* Main Content */}
      <main id="main-content" className="pb-24 md:pb-8 animate-fade-in flex-1" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}