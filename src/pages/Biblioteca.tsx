import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { extractTextFromPDF } from '../lib/pdfUtils'
import PageLayout from '../components/PageLayout'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

// Categorias Sugeridas
const CATEGORIAS_DOCS = [
  { id: 'atas', label: 'Atas de Assembleia', icon: '📝', color: 'bg-blue-100 text-blue-700' },
  { id: 'regimento', label: 'Regimento Interno', icon: '📜', color: 'bg-purple-100 text-purple-700' },
  { id: 'convencao', label: 'Convenção', icon: '⚖️', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'editais', label: 'Editais', icon: '📢', color: 'bg-orange-100 text-orange-700' },
  { id: 'financeiro', label: 'Prestação de Contas', icon: '💰', color: 'bg-green-100 text-green-700' },
  { id: 'contratos', label: 'Contratos', icon: '🤝', color: 'bg-gray-100 text-gray-700' },
  { id: 'outros', label: 'Outros', icon: '📁', color: 'bg-gray-100 text-gray-600' }
]

interface Documento {
  id: number
  title: string
  content: string
  metadata: {
    title: string
    source: string
    url?: string
    category?: string // Nova propriedade
  }
  created_at: string
}

export default function Biblioteca() {
  const [docs, setDocs] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  
  // Estados do Modal de Upload
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [uploadCategory, setUploadCategory] = useState('atas')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadDocs()
  }, [])

  async function loadDocs() {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('id', { ascending: false })

      if (error) throw error
      setDocs(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // 1. Selecionar Arquivo
  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type !== 'application/pdf') {
        alert('Apenas arquivos PDF são permitidos.')
        return
      }
      setSelectedFile(file)
    }
  }

  // 2. Processar e Salvar (Upload)
  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      const categoryLabel = CATEGORIAS_DOCS.find(c => c.id === uploadCategory)?.label || 'Documento'

      // Extrair texto para a IA
      console.log('Lendo PDF...')
      const textContent = await extractTextFromPDF(selectedFile)
      
      // Upload físico no Storage
      const fileName = `${Date.now()}_${selectedFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('biblioteca')
        .upload(fileName, selectedFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('biblioteca')
        .getPublicUrl(fileName)

      // Salvar no Banco (Com Categoria e Tags Automáticas)
      const { error: dbError } = await supabase.from('documents').insert({
        title: selectedFile.name.replace('.pdf', ''),
        content: textContent,
        // Tags inteligentes: Categoria + termos comuns para ajudar a busca
        tags: `${categoryLabel.toLowerCase()} ${uploadCategory} pdf documento oficial`,
        metadata: {
          title: selectedFile.name,
          source: categoryLabel, // Usa o nome bonito da categoria como fonte
          category: uploadCategory, // ID da categoria para filtros
          url: publicUrl
        }
      })

      if (dbError) throw dbError

      alert('Documento salvo e indexado com sucesso!')
      setIsModalOpen(false)
      setSelectedFile(null)
      loadDocs()

    } catch (error: any) {
      console.error('Erro no upload:', error)
      alert('Erro ao processar documento: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  // Filtragem
  const filteredDocs = docs.filter(d => {
    const matchesSearch = d.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedFilter ? d.metadata?.category === selectedFilter : true
    
    return matchesSearch && matchesCategory
  })

  if (loading) return <LoadingSpinner message="Carregando biblioteca..." />

  return (
    <PageLayout 
      title="Biblioteca Digital" 
      subtitle="Acervo de documentos oficiais do condomínio" 
      icon="📚"
      headerAction={
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-bold hover:bg-white/30 transition text-sm flex items-center gap-2 border border-white/30"
        >
          <span className="text-lg">+</span> Novo Documento
        </button>
      }
    >
      {/* Barra de Busca e Filtros */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <input 
              type="text" 
              placeholder="Buscar em todo o conteúdo dos documentos..." 
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>

        {/* Filtros Rápidos */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setSelectedFilter(null)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition shrink-0 ${!selectedFilter ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Todos
          </button>
          {CATEGORIAS_DOCS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedFilter(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition shrink-0 flex items-center gap-1 ${selectedFilter === cat.id ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Documentos */}
      {filteredDocs.length > 0 ? (
        <div className="grid gap-4">
          {filteredDocs.map((doc) => {
            const category = CATEGORIAS_DOCS.find(c => c.id === doc.metadata?.category) || CATEGORIAS_DOCS[6] // Default Outros
            
            return (
              <div key={doc.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:border-primary transition group relative overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${category.color}`}>
                      {category.icon} {category.label}
                    </span>
                  </div>
                  
                  {doc.metadata?.url && (
                    <a 
                      href={doc.metadata.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-gray-400 hover:text-primary transition p-1 rounded-full hover:bg-gray-50"
                      title="Baixar PDF"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </a>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                  {doc.title || doc.metadata?.title}
                </h3>
                
                {/* Preview do Conteúdo (Trecho) */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 h-20 overflow-hidden relative group-hover:bg-blue-50/30 transition-colors">
                  <p className="text-xs text-gray-500 leading-relaxed font-mono break-words">
                    {doc.content.slice(0, 300)}...
                  </p>
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 to-transparent group-hover:from-[#F0F9FF]"></div>
                </div>
                
                <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                   <span className="flex items-center gap-1">
                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                     Indexado na IA
                   </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState 
          icon="📭" 
          title="Nenhum documento encontrado" 
          description={searchTerm ? "Tente buscar por outro termo." : "A biblioteca está vazia no momento."} 
        />
      )}

      {/* MODAL DE UPLOAD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Adicionar Documento</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Seleção de Categoria */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Categoria</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIAS_DOCS.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setUploadCategory(cat.id)}
                        className={`
                          text-xs font-semibold py-2 px-3 rounded-lg border text-left flex items-center gap-2 transition
                          ${uploadCategory === cat.id 
                            ? `${cat.color} border-current ring-1 ring-current` 
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}
                        `}
                      >
                        <span>{cat.icon}</span> {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Seleção de Arquivo */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Arquivo PDF</label>
                  <input 
                    type="file" 
                    accept=".pdf"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={onFileSelect}
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition
                      ${selectedFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}
                    `}
                  >
                    {selectedFile ? (
                      <div className="text-green-700">
                        <div className="text-2xl mb-1">📄</div>
                        <p className="font-bold text-sm truncate">{selectedFile.name}</p>
                        <p className="text-xs opacity-70">Clique para trocar</p>
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        <div className="text-2xl mb-1">📤</div>
                        <p className="font-medium text-sm">Clique para selecionar PDF</p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processando e Indexando...
                    </>
                  ) : (
                    'Enviar e Indexar na IA'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </PageLayout>
  )
}