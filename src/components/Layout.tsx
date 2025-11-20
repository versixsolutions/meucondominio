import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { useTheme } from '../contexts/ThemeContext'
import LoadingSpinner from './LoadingSpinner'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const { stats } = useDashboardStats()
  const { theme, loading } = useTheme()

  const isActive = (path: string) => location.pathname === path

  // Menu Desktop (Visão completa com submenu implícito)
  const desktopNavItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/comunicacao', label: 'Comunicação', icon: '📢' },
    { path: '/suporte', label: 'Suporte', icon: '🤝' },
    { path: '/transparencia', label: 'Transparência', icon: '⚖️' },
    { path: '/perfil', label: 'Perfil', icon: '👤' },
  ]

  // Menu Mobile (Estrutura 5 itens exatos)
  const mobileNavItems = [
    { path: '/', label: 'Início', icon: '🏠' },
    { path: '/comunicacao', label: 'Comunicação', icon: '📢' },
    { path: '/suporte', label: 'Suporte', icon: '🤝' },
    { path: '/transparencia', label: 'Transparência', icon: '⚖️' },
    { path: '/perfil', label: 'Perfil', icon: '👤' },
  ]

  async function handleLogout() {
    if (confirm('Tem certeza que deseja sair?')) {
      await signOut()
      navigate('/login')
    }
  }

  if (loading) return <LoadingSpinner message="Carregando..." />

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header Desktop */}
      <header 
        className="text-white shadow-lg sticky top-0 z-50 transition-all duration-500"
        style={{ background: theme.gradients.header }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-2xl backdrop-blur-sm">
                🏢
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold tracking-tight leading-tight">
                  Versix Meu Condomínio
                </h1>
                <p className="text-xs opacity-90 font-medium flex flex-col md:flex-row md:gap-1">
                  <span className="font-bold text-white">
                    {profile?.condominio_name || 'Carregando...'}
                  </span>
                </p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {desktopNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 py-2 rounded-lg font-medium text-sm transition duration-200 flex items-center gap-2 ${
                    isActive(item.path) 
                      ? 'bg-white/20 text-white shadow-inner' 
                      : 'hover:bg-white/10 text-white/90'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* User Menu Desktop */}
            <div className="flex items-center gap-3">
              <Link to="/perfil" className="hidden md:block text-right hover:opacity-80 transition">
                <p className="text-sm font-bold leading-tight">{profile?.full_name?.split(' ')[0]}</p>
                <p className="text-[10px] uppercase tracking-wider opacity-80 font-semibold">
                  {profile?.role === 'sindico' ? '👑 Síndico' : '🏠 Morador'}
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

      {/* Mobile Bottom Nav - 5 Colunas Exatas */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe safe-area-pb">
        <div className="grid grid-cols-5 gap-1 p-1">
          {mobileNavItems.map((item) => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center py-2 rounded-lg transition duration-200"
                style={{ 
                  color: active ? theme.colors.primary.DEFAULT : theme.colors.text.secondary,
                  backgroundColor: active ? theme.colors.primary[50] : 'transparent'
                }}
              >
                <span className="text-xl mb-0.5">{item.icon}</span>
                <span className={`text-[9px] font-medium truncate w-full text-center ${active ? 'font-bold' : ''}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-24 md:pb-8 animate-fade-in">
        <Outlet />
      </main>
    </div>
  )
}