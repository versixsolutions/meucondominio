import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import PageLayout from '../components/PageLayout'
import LoadingSpinner from '../components/LoadingSpinner'

const ASSUNTOS = [
  'Administrativo',
  'Financeiro',
  'Sugestão',
  'Reclamação',
  'Elogio',
  'Outros'
]

export default function NovoChamado() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    subject: 'Administrativo',
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    try {
      const { error } = await supabase.from('chamados').insert({
        user_id: user.id,
        // Identificação visual clara para o síndico saber a origem (Atualizado para Norma)
        subject: `[Suporte] ${formData.subject}`, 
        description: formData.description,
        status: 'aberto'
      })

      if (error) throw error

      alert('Mensagem enviada com sucesso! Você será notificado quando o síndico responder.')
      navigate('/perfil') // Volta para o perfil para ver o ticket criado

    } catch (error: any) {
      console.error('Erro ao enviar:', error)
      alert('Erro ao enviar mensagem: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner message="Enviando mensagem..." />

  return (
    <PageLayout 
      title="Falar com o Síndico" 
      subtitle="Canal direto para assuntos administrativos e pessoais" 
      icon="💬"
    >
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        
        <div className="space-y-6">
          
          {/* Aviso */}
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3">
            <span className="text-2xl">💡</span>
            <p className="text-sm text-blue-800 leading-relaxed">
              Este canal é para mensagens diretas. Para problemas físicos no condomínio (lâmpada queimada, limpeza), prefira usar a opção <strong>Abrir Ocorrência</strong>. Para dúvidas sobre regras, use o <strong>Chatbot</strong>.
            </p>
          </div>

          {/* Assunto */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Assunto</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {ASSUNTOS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFormData({ ...formData, subject: item })}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition border
                    ${formData.subject === item 
                      ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500' 
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}
                  `}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Mensagem */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Sua Mensagem</label>
            <textarea
              required
              rows={6}
              placeholder="Escreva aqui sua mensagem para a administração..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none text-gray-700"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!formData.description.trim()}
              className="flex-1 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enviar Mensagem
            </button>
          </div>

        </div>
      </form>
    </PageLayout>
  )
}