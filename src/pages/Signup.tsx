import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCondominios } from '../hooks/useCondominios'
import type { Condominio } from '../types'

// Logo Versix
const logo = '/assets/logos/versix-solutions-logo.png'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [condominioId, setCondominioId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignedUp, setIsSignedUp] = useState(false)

  const { signUp } = useAuth()
  const { condominios, loading: loadingCondominios } = useCondominios()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!condominioId) {
      setError('Por favor, selecione seu condomínio.')
      setLoading(false)
      return
    }
    
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
      setLoading(false)
      return
    }

    try {
      // O Supabase envia o e-mail de confirmação
      await signUp(email, password, fullName, condominioId)
      setIsSignedUp(true)
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Tela de Aviso de Confirmação de E-mail
  if (isSignedUp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="text-center mb-8">
            <img
              src={logo}
              alt="Versix Meu Condominio"
              className="w-40 h-auto mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-gray-900">Quase lá!</h1>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-semibold">
              Sua conta foi criada com sucesso!
            </p>
            <p className="text-green-700 mt-2">
              Enviamos um link de confirmação para **{email}**. Por favor, verifique sua caixa de entrada (e spam) para ativar sua conta.
            </p>
          </div>
          <Link
            to="/login"
            className="w-full inline-block bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-dark transition"
          >
            Voltar para o Login
          </Link>
        </div>
      </div>
    )
  }

  // Formulário de Cadastro
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="Versix Meu Condominio"
            className="w-40 h-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900">Versix Meu Condominio</h1>
          <p className="text-gray-600 mt-2">Crie sua conta de morador</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Campo Nome Completo */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Nome Completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome completo"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          {/* Campo Seleção de Condomínio */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Selecione seu Condomínio
            </label>
            <select
              value={condominioId}
              onChange={(e) => setCondominioId(e.target.value)}
              required
              disabled={loadingCondominios}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none"
            >
              <option value="" disabled>
                {loadingCondominios ? 'Carregando condomínios...' : 'Escolha um condomínio'}
              </option>
              {condominios.map((cond: Condominio) => (
                <option key={cond.id} value={cond.id}>
                  {cond.name}
                </option>
              ))}
            </select>
          </div>

          {/* Campo Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          {/* Campo Senha */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
          </div>

          <button
            type="submit"
            disabled={loading || loadingCondominios}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Já tem conta?{' '}
          <Link to="/login" className="text-primary font-semibold hover:text-primary-dark">
            Fazer Login
          </Link>
        </p>
      </div>
    </div>
  )
}
