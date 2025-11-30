import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import PageLayout from '../components/PageLayout'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast' // Importação

const CATEGORIES = [
  { id: 'manutencao', label: 'Manutenção', icon: '🔧', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { id: 'limpeza', label: 'Limpeza', icon: '🧹', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: 'seguranca', label: 'Segurança', icon: '🛡️', color: 'bg-red-50 border-red-200 text-red-700' },
  { id: 'barulho', label: 'Barulho', icon: '🔊', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { id: 'outro', label: 'Outros', icon: '📝', color: 'bg-gray-50 border-gray-200 text-gray-700' },
]

export default function NovaOcorrencia() {
  const navigate = useNavigate()
  const { user, profile } = useAuth() 
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: 'manutencao'
  })

  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // Validação básica de tamanho (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 2MB.')
        return
      }
      setSelectedImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile?.condominio_id) {
      toast.error('Erro de sessão. Faça login novamente.')
      return
    }
    
    setLoading(true)
    const toastId = toast.loading('Registrando ocorrência...')

    try {
      let photoUrl = null

      if (selectedImage) {
        toast.loading('Enviando foto...', { id: toastId })
        const fileExt = selectedImage.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}` // Timestamp para unicidade
        
        const { error: uploadError } = await supabase.storage
          .from('ocorrencias')
          .upload(fileName, selectedImage)

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('ocorrencias').getPublicUrl(fileName)
        photoUrl = data.publicUrl
      }

      const { error: insertError } = await supabase.from('ocorrencias').insert({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        status: 'aberto',
        photo_url: photoUrl,
        author_id: user.id,
        condominio_id: profile.condominio_id
      })

      if (insertError) throw insertError

      toast.success('Ocorrência registrada com sucesso!', { id: toastId })
      navigate('/ocorrencias')

    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao registrar: ' + error.message, { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner message="Processando..." />

  return (
    <PageLayout 
      title="Nova Ocorrência" 
      subtitle="Relate um problema para a administração" 
      icon="📝"
    >
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
            Qual o tipo do problema?
          </label>
          <div className="grid grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat.id })}
                className={`
                  flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                  ${formData.category === cat.id 
                    ? `${cat.color} border-current shadow-sm scale-[1.02]` 
                    : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50 grayscale'}
                `}
              >
                <span className="text-2xl mb-1">{cat.icon}</span>
                <span className="text-[10px] font-bold uppercase">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Título do Relato</label>
            <input
              type="text"
              required
              placeholder="Ex: Lâmpada queimada no hall"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Local exato</label>
            <input
              type="text"
              required
              placeholder="Ex: Bloco C, 2º andar, escadas"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Descrição detalhada</label>
            <textarea
              required
              rows={4}
              placeholder="Descreva o que aconteceu ou o que precisa ser feito..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <label className="block text-sm font-bold text-gray-700 mb-3">Adicionar Foto (Opcional)</label>
          
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef}
            className="hidden" 
            onChange={handleImageChange}
          />

          {!previewUrl ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition text-gray-400 group"
            >
              <svg className="w-10 h-10 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-semibold">Toque para tirar foto ou carregar</span>
            </div>
          ) : (
            <div className="relative">
              <img src={previewUrl} alt="Preview" loading="lazy" decoding="async" className="w-full h-64 object-cover rounded-xl shadow-sm" />
              <button
                type="button"
                onClick={() => { setPreviewUrl(null); setSelectedImage(null); }}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-2 pb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-3.5 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:opacity-90 transition disabled:opacity-50"
          >
            Enviar Ocorrência
          </button>
        </div>

      </form>
    </PageLayout>
  )
}