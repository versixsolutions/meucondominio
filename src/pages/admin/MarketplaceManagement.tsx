import { useState, useEffect, useRef } from 'react'
import Tooltip from '../../components/ui/Tooltip'
import { supabase } from '../../lib/supabase'
import { useAdmin } from '../../contexts/AdminContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'

interface Ad {
  id: string
  title: string
  image_url: string
  link_url: string
  active: boolean
  views: number
  clicks: number
  created_at: string
}

export default function MarketplaceManagement() {
  const { selectedCondominioId } = useAdmin() // Pode ser usado para filtrar por condomínio no futuro
  
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const [title, setTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadAds()
  }, [])

  async function loadAds() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('marketplace_ads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAds(data || [])
    } catch (error: any) {
      console.error('Erro:', error)
      toast.error('Erro ao carregar anúncios.')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleActive(ad: Ad) {
    try {
      const { error } = await supabase
        .from('marketplace_ads')
        .update({ active: !ad.active })
        .eq('id', ad.id)

      if (error) throw error
      setAds(prev => prev.map(a => a.id === ad.id ? { ...a, active: !a.active } : a))
      toast.success(`Anúncio ${!ad.active ? 'ativado' : 'desativado'}!`)
    } catch (error) {
      toast.error('Erro ao atualizar status.')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este anúncio?')) return
    try {
      await supabase.from('marketplace_ads').delete().eq('id', id)
      setAds(prev => prev.filter(a => a.id !== id))
      toast.success('Anúncio excluído.')
    } catch (error) {
      toast.error('Erro ao excluir.')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFile || !title) {
      toast.error('Preencha o título e selecione uma imagem.')
      return
    }

    setUploading(true)
    const toastId = toast.loading('Enviando banner...')

    try {
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('marketplace')
        .upload(fileName, selectedFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('marketplace')
        .getPublicUrl(fileName)

      const { error: dbError } = await supabase.from('marketplace_ads').insert({
        title,
        link_url: linkUrl,
        image_url: publicUrl,
        active: true
      })

      if (dbError) throw dbError

      toast.success('Banner publicado com sucesso!', { id: toastId })
      setIsModalOpen(false)
      setTitle('')
      setLinkUrl('')
      setSelectedFile(null)
      loadAds()

    } catch (error: any) {
      console.error(error)
      toast.error('Erro ao publicar: ' + error.message, { id: toastId })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Marketplace</h1>
          <p className="text-gray-500 text-sm">Controle os banners publicitários exibidos no app.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-indigo-700 transition flex items-center gap-2"
        >
          <span>📢</span> Novo Banner
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : ads.length === 0 ? (
        <EmptyState icon="🖼️" title="Sem anúncios" description="Nenhum banner ativo no momento." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div key={ad.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden group ${ad.active ? 'border-gray-200' : 'border-red-200 opacity-75 grayscale'}`}>
              <div className="relative h-32 bg-gray-100">
                <img src={ad.image_url} alt={ad.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                {!ad.active && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center backdrop-blur-sm">
                    <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded uppercase">Inativo</span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 truncate flex-1 mr-2" title={ad.title}>{ad.title}</h3>
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-mono">CTR: {ad.views > 0 ? ((ad.clicks / ad.views) * 100).toFixed(1) : 0}%</span>
                </div>
                
                <a href={ad.link_url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline truncate block mb-4">
                  {ad.link_url || 'Sem link de destino'}
                </a>
                
                <div className="grid grid-cols-2 gap-2 mb-4 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <div className="text-center">
                    <span className="block text-lg font-bold text-gray-800">{ad.views}</span>
                    <span className="text-[10px] text-gray-500 uppercase font-bold">Views</span>
                  </div>
                  <div className="text-center border-l border-gray-200">
                    <span className="block text-lg font-bold text-green-600">{ad.clicks}</span>
                    <span className="text-[10px] text-gray-500 uppercase font-bold">Cliques</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Tooltip content={ad.active ? 'Pausar a exibição deste banner' : 'Ativar banner para usuários'} side="top">
                    <button 
                      onClick={() => handleToggleActive(ad)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${ad.active ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}
                      aria-label={ad.active ? 'Pausar anúncio' : 'Ativar anúncio'}
                    >
                      {ad.active ? 'Pausar' : 'Ativar'}
                    </button>
                  </Tooltip>
                  <Tooltip content="Excluir permanentemente" side="top">
                    <button 
                      onClick={() => handleDelete(ad.id)}
                      className="px-3 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-50 border border-gray-200"
                      aria-label="Excluir anúncio"
                    >
                      🗑️
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Banner Publicitário">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800 flex gap-2 items-start">
             <span>ℹ️</span>
             <p>Para melhor visualização no app, use imagens no formato <strong>paisagem (horizontal)</strong>, como 800x300px.</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Título da Campanha</label>
            <input type="text" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Promoção Pizzaria" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Link de Destino (Opcional)</label>
            <input type="url" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..." />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Imagem do Banner</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <span className="text-3xl block mb-2">🖼️</span>
                <span className="text-sm text-gray-500 font-medium">{selectedFile ? selectedFile.name : 'Clique para selecionar imagem'}</span>
                <input ref={fileInputRef} type="file" accept="image/*" required className="hidden" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
            </div>
          </div>

          <button type="submit" disabled={uploading} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-md transition">
            {uploading ? 'Enviando...' : 'Publicar Banner'}
          </button>
        </form>
      </Modal>
    </div>
  )
}