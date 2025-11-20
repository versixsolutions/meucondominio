import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { useTheme } from '../contexts/ThemeContext'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const { stats } = useDashboardStats()
  const { theme, toggleTheme } = useTheme()

  const isActive = (path: string) => location.pathname === path

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/faq', label: 'FAQ', icon: '❓' },
    { path: '/despesas', label: 'Despesas', icon: '💰' },
    { path: '/votacoes', label: 'Votações', icon: '🗳️', badge: stats.votacoes.ativas },
    { path: '/ocorrencias', label: 'Ocorrências', icon: '🚨', badge: stats.ocorrencias.abertas + stats.ocorrencias.em_andamento },
    { path: '/comunicados', label: 'Comunicados', icon: '📢', badge: stats.comunicados.nao_lidos },
  ]

  async function handleLogout() {
    if (confirm('Tem certeza que deseja sair?')) {
      await signOut()
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
                🏢
              </div>
              <div>
                <h1 className="text-xl font-bold">Condomix</h1>
                <p className="text-xs text-purple-200">Residencial Alameda</p>
              </div>
              <button
  onClick={toggleTheme}
  className="p-2 hover:bg-white/20 rounded-lg transition"
  title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
>
  {theme === 'dark' ? '☀️' : '🌙'}
</button>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 py-2 rounded-lg font-medium text-sm transition ${
                    isActive(item.path) ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold">{profile?.full_name}</p>
                <p className="text-xs text-purple-200">
                  {profile?.role === 'sindico' ? '👑 Síndico' : '🏠 Morador'}
                  {profile?.unit_number && ` • ${profile.unit_number}`}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-white/20 rounded-lg transition"
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

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center p-2 rounded-lg transition ${
                isActive(item.path) ? 'text-purple-600 bg-purple-50' : 'text-gray-600'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
              {item.badge > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-20 md:pb-4">
        <Outlet />
      </main>
      <InstallPWA />
    </div>
  )
}
