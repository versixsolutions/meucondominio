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
  
  // Novos Estados
  const [residentType, setResidentType] = useState('titular')
  const [unitNumber, setUnitNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [isWhatsapp, setIsWhatsapp] = useState(true)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignedUp, setIsSignedUp] = useState(false)

  const { signUp } = useAuth()
  const { condominios, loading: loadingCondominios } = useCondominios()

  // Formata telefone enquanto digita: (99) 99999-9999
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)
    
    if (value.length > 2) {
      value = `(${value.substring(0, 2)}) ${value.substring(2)}`
    }
    if (value.length > 10) {
      value = `${value.substring(0, 10)}-${value.substring(10)}`
    }
    setPhone(value)
  }

  // Permite apenas números no campo de unidade
  const handleUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    setUnitNumber(value)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!condominioId) {
      setError('Por favor, selecione seu condomínio.')
      setLoading(false)
      return
    }
    
    if (!unitNumber) {
      setError('O número da unidade é obrigatório.')
      setLoading(false)
      return
    }

    if (!phone || phone.length < 14) { // Validação simples de tamanho (xx) xxxxx-xxxx
      setError('Por favor, informe um telefone válido.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
      setLoading(false)
      return
    }

    try {
      await signUp(
        email, 
        password, 
        fullName, 
        condominioId,
        phone,
        unitNumber,
        residentType,
        isWhatsapp
      )
      setIsSignedUp(true)
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (isSignedUp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="text-center mb-8">
            <img src={logo} alt="Versix" className="w-40 h-auto mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Quase lá!</h1>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-semibold">Sua conta foi criada com sucesso!</p>
            <p className="text-green-700 mt-2">
              Enviamos um link de confirmação para <strong>{email}</strong>. Verifique sua caixa de entrada.
            </p>
          </div>
          <Link to="/login" className="w-full inline-block bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-dark transition">
            Voltar para o Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 my-8">
        <div className="text-center mb-6">
          <img src={logo} alt="Versix" className="w-32 h-auto mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-gray-900">Meu Condominio</h1>
          <p className="text-gray-600 text-sm">Crie sua conta de morador</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Nome Completo */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Nome Completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome completo"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          {/* Condomínio */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Condomínio</label>
            <select
              value={condominioId}
              onChange={(e) => setCondominioId(e.target.value)}
              required
              disabled={loadingCondominios}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none bg-white"
            >
              <option value="" disabled>
                {loadingCondominios ? 'Carregando...' : 'Selecione seu condomínio'}
              </option>
              {condominios.map((cond: Condominio) => (
                <option key={cond.id} value={cond.id}>{cond.name}</option>
              ))}
            </select>
          </div>

          {/* Tipo de Morador e Unidade (Grid) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Sou</label>
              <select
                value={residentType}
                onChange={(e) => setResidentType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
              >
                <option value="titular">Titular (Dono)</option>
                <option value="inquilino">Inquilino</option>
                <option value="morador">Morador</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Nº Unidade</label>
              <input
                type="text"
                inputMode="numeric"
                value={unitNumber}
                onChange={handleUnitChange}
                placeholder="Ex: 102"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Celular / WhatsApp</label>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(99) 99999-9999"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isWhatsapp}
                onChange={(e) => setIsWhatsapp(e.target.checked)}
                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <span className="text-xs text-gray-600">Este número é WhatsApp</span>
            </label>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          {/* Senha */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
            <p className="text-[10px] text-gray-400 mt-1 text-right">Mínimo 6 caracteres</p>
          </div>

          <button
            type="submit"
            disabled={loading || loadingCondominios}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

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