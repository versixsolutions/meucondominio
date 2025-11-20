import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface PageLayoutProps {
  title: string
  subtitle?: string
  icon?: string
  children: React.ReactNode
  headerAction?: React.ReactNode
  showBackButton?: boolean
}

export default function PageLayout({
  title,
  subtitle,
  icon,
  children,
  headerAction,
  showBackButton = true,
}: PageLayoutProps) {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {showBackButton && (
                <button
                  onClick={() => navigate('/')}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                  aria-label="Voltar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
              )}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  {icon && <span>{icon}</span>}
                  {title}
                </h1>
                {subtitle && <p className="text-purple-200 text-sm md:text-base">{subtitle}</p>}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-sm">{profile?.full_name}</p>
                <p className="text-xs text-purple-200">
                  {profile?.role === 'sindico' ? '👑 Síndico' : '🏠 Morador'}
                </p>
              </div>
              <button
                onClick={signOut}
                className="bg-white/20 px-4 py-2 rounded-lg text-sm hover:bg-white/30 transition"
              >
                Sair
              </button>
            </div>
          </div>

          {headerAction && (
            <div className="mt-3">
              {headerAction}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
        <div className="grid grid-cols-5 gap-1">
          <button
            onClick={() => navigate('/')}
            className="flex flex-col items-center py-2 text-purple-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Início</span>
          </button>

          <button
            onClick={() => navigate('/faq')}
            className="flex flex-col items-center py-2 text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs mt-1">FAQ</span>
          </button>

          <button
            onClick={() => navigate('/despesas')}
            className="flex flex-col items-center py-2 text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs mt-1">Despesas</span>
          </button>

          <button
            onClick={() => navigate('/votacoes')}
            className="flex flex-col items-center py-2 text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span className="text-xs mt-1">Votações</span>
          </button>

          <button
            onClick={() => navigate('/ocorrencias')}
            className="flex flex-col items-center py-2 text-gray-600"
          >
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
