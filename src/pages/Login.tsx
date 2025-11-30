import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

// Logo atualizada
const logo = '/assets/logos/versix-solutions-logo.png'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { signIn } = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    // 1. IMPEDE O RECARREGAMENTO DA PÁGINA IMEDIATAMENTE
    e.preventDefault()
    
    // Validação básica
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.')
      return
    }

    setError('')
    setLoading(true)

    try {
      // 2. Tenta o login
      await signIn(email, password)
      
      // 3. Redirecionamento de sucesso
      // Nota: O AuthContext ou App.tsx já deve tratar o redirecionamento
      // baseado no perfil (Admin -> /admin, Morador -> /), mas forçamos aqui por segurança.
      navigate('/', { replace: true }) 
      
    } catch (err: any) {
      logger.error('Erro no login', err, { email })
      // Mensagens de erro amigáveis
      if (err.message.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos. Verifique e tente novamente.')
      } else if (err.message.includes('Email not confirmed')) {
        setError('Seu email ainda não foi confirmado. Verifique sua caixa de entrada.')
      } else {
        setError(err.message || 'Ocorreu um erro ao fazer login.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fade-in">
        
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="Versix Norma"
            className="w-40 h-auto mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl font-bold text-gray-900">Bem-vindo de volta!</h1>
          <p className="text-gray-500 text-sm mt-2">Acesse sua conta para continuar.</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 animate-shake">
              <span className="text-red-500 mt-0.5">⚠️</span>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
              autoComplete="username"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                Senha
              </label>
              {/* Link de recuperação de senha (Opcional - Placeholder) */}
              {/* <Link to="/forgot-password" class="text-xs text-primary hover:underline">Esqueceu?</Link> */}
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3.5 rounded-lg font-bold text-sm hover:bg-primary-dark hover:shadow-lg transform transition active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Entrando...
              </>
            ) : (
              'Entrar na Plataforma'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Ainda não tem conta?{' '}
            <Link to="/signup" className="text-primary font-bold hover:underline">
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </div>
      
      {/* Copyright Footer */}
      <div className="absolute bottom-4 text-white/60 text-xs">
        &copy; {new Date().getFullYear()} Versix Solutions. Todos os direitos reservados.
      </div>
    </div>
  )
}