import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext' // Importar contexto
import { extractTextFromPDF } from '../lib/pdfUtils'
import PageLayout from '../components/PageLayout'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

// CONSTANTE GLOBAL
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
    category?: string
  }
  created_at: string
}

function sanitizeFileName(name: string) {
  return name
    .normalize('NFD')               
    .replace(/[\u0300-\u036f]/g, '') 
    .replace(/\s+/g, '_')           
    .replace(/[^a-zA-Z0-9._-]/g, '') 
    .toLowerCase()
}

export default function Biblioteca() {
  const { profile, canManage, user } = useAuth()
  const [docs, setDocs] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  
  // Estado para controlar quais documentos estão expandidos (Set de IDs)
  const [expandedDocs, setExpandedDocs] = useState<Set<number>>(new Set())
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [uploadCategory, setUploadCategory] = useState('atas')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profile?.condominio_id) {
      loadDocs()
    }
  }, [profile?.condominio_id])

  async function loadDocs() {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('condominio_id', profile?.condominio_id)
        .order('id', { ascending: false })

      if (error) throw error
      setDocs(data || [])
    } catch (error) { console.error(error) } finally { setLoading(false) }
  }

  const toggleExpand = (id: number) => {
    setExpandedDocs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleUpload = async () => {
    if (!selectedFile || !profile?.condominio_id || !canManage || !user) return

    setUploading(true)
    try {
      const categoryLabel = CATEGORIAS_DOCS.find(c => c.id === uploadCategory)?.label || 'Documento'
      
      const textContent = await extractTextFromPDF(selectedFile)
      
      const cleanName = sanitizeFileName(selectedFile.name)
      const fileName = `${profile.condominio_id}/${Date.now()}_${cleanName}`

      const { error: uploadError } = await supabase.storage
        .from('biblioteca')
        .upload(fileName, selectedFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('biblioteca')
        .getPublicUrl(fileName)

      const { error: dbError } = await supabase.from('documents').insert({
        title: selectedFile.name.replace('.pdf', ''),
        content: textContent,
        tags: `${categoryLabel.toLowerCase()} ${uploadCategory} pdf documento oficial`,
        condominio_id: profile.condominio_id,
        metadata: {
          title: selectedFile.name,
          source: categoryLabel,
          category: uploadCategory,
          url: publicUrl
        }
      })

      if (dbError) throw dbError

      // --- NOVO: CRIAR COMUNICADO AUTOMÁTICO ---
      // Isso garante que apareça no feed e dispare notificação (via trigger ou webhook do Supabase)
      const { error: comunicError } = await supabase.from('comunicados').insert({
        title: `Novo Documento: ${selectedFile.name.replace('.pdf', '')}`,
        content: `Um novo arquivo foi adicionado à Biblioteca Digital na categoria **${categoryLabel}**. \n\nAcesse a biblioteca para visualizar ou baixar o documento completo.`,
        type: 'informativo', // Usa um tipo existente para garantir compatibilidade
        priority: 1,
        author_id: user.id,
        condominio_id: profile.condominio_id
      })

      if (comunicError) {
        console.error("Erro ao criar comunicado automático:", comunicError)
        // Não falhamos o upload se o comunicado falhar, apenas logamos
      }
      // -----------------------------------------

      alert('Documento salvo e publicado no mural!')
      setIsModalOpen(false)
      setSelectedFile(null)
      loadDocs()

    } catch (error: any) {
      alert('Erro: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const filteredDocs = docs.filter(d => {
    const matchesSearch = d.content.toLowerCase().includes(searchTerm.toLowerCase()) || d.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedFilter ? d.metadata?.category === selectedFilter : true
    return matchesSearch && matchesCategory
  })

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0])
  }

  if (loading) return <LoadingSpinner message="Carregando biblioteca..." />

  return (
    <PageLayout 
      title="Biblioteca Digital" 
      subtitle="Acervo de documentos oficiais" 
      icon="📚"
      headerAction={
        canManage ? (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-bold hover:bg-white/30 transition text-sm flex items-center gap-2 border border-white/30"
          >
            <span className="text-lg">+</span> Novo Documento
          </button>
        ) : null
      }
    >
      <div className="mb-6 space-y-4">
        <div className="relative">
          <input type="text" placeholder="Buscar nos documentos..." className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => setSelectedFilter(null)} className={`px-4 py-1.5 rounded-full text-xs font-bold border transition shrink-0 ${!selectedFilter ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Todos</button>
          {CATEGORIAS_DOCS.map((cat) => (
            <button key={cat.id} onClick={() => setSelectedFilter(cat.id)} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition shrink-0 flex items-center gap-1 ${selectedFilter === cat.id ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 hover:bg-gray-50'}`}><span>{cat.icon}</span> {cat.label}</button>
          ))}
        </div>
      </div>

      {filteredDocs.length > 0 ? (
        <div className="grid gap-4">
          {filteredDocs.map((doc) => {
            const category = CATEGORIAS_DOCS.find(c => c.id === doc.metadata?.category) || CATEGORIAS_DOCS[6]
            const isExpanded = expandedDocs.has(doc.id)
            
            // Resumo: Pega os primeiros 180 caracteres
            const summary = doc.content.slice(0, 180).replace(/\s+/g, ' ') + (doc.content.length > 180 ? '...' : '')

            return (
              <div key={doc.id} className={`bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:border-primary transition group relative overflow-hidden ${isExpanded ? 'ring-2 ring-primary ring-opacity-50' : ''}`}>
                
                {/* Header do Card */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${category.color}`}>
                      {category.icon} {category.label}
                    </span>
                  </div>
                  {/* Botão de Download só aparece se expandido */}
                  {isExpanded && doc.metadata?.url && (
                    <a 
                      href={doc.metadata.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-gray-400 hover:text-primary transition p-1 rounded-full hover:bg-gray-50 animate-fade-in" 
                      title="Baixar PDF Completo"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </a>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{doc.title || doc.metadata?.title}</h3>
                
                {/* Conteúdo Condicional */}
                <div className={`bg-gray-50 p-3 rounded-lg border border-gray-100 relative transition-all duration-300 ${isExpanded ? 'bg-white border-gray-200' : 'h-auto'}`}>
                  
                  {isExpanded ? (
                    // Conteúdo Expandido (Exibe mais texto + Link)
                    <div className="animate-fade-in">
                       {/* Exibe um trecho maior, mas ainda não tudo se for gigante, para não quebrar layout */}
                       <p className="text-sm text-gray-700 leading-relaxed font-mono whitespace-pre-line mb-4">
                         {doc.content.slice(0, 1000)}
                         {doc.content.length > 1000 && <span className="text-gray-400 italic"> (conteúdo truncado para visualização)</span>}
                       </p>
                       
                       <div className="flex justify-end pt-2 border-t border-gray-100">
                          {doc.metadata?.url && (
                            <a 
                              href={doc.metadata.url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-dark transition shadow-sm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                              Abrir PDF Completo
                            </a>
                          )}
                       </div>
                    </div>
                  ) : (
                    // Resumo (Estado Recolhido)
                    <div>
                      <p className="text-xs text-gray-500 leading-relaxed font-mono break-words">
                        {summary}
                      </p>
                      {/* Gradiente para indicar continuidade */}
                      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none"></div>
                    </div>
                  )}

                </div>

                {/* Botão de Toggle (Leia Mais / Menos) */}
                <button 
                  onClick={() => toggleExpand(doc.id)}
                  className="mt-3 text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1 hover:underline focus:outline-none"
                >
                  {isExpanded ? (
                    <>Ler menos <svg className="w-3 h-3 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></>
                  ) : (
                    <>Leia mais e acesse o PDF <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></>
                  )}
                </button>

              </div>
            )
          })}
        </div>
      ) : (<EmptyState icon="📭" title="Nenhum documento" description="A biblioteca está vazia." />)}

      {canManage && isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-gray-900">Adicionar Documento</h3><button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Categoria</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIAS_DOCS.map((cat) => (
                      <button key={cat.id} onClick={() => setUploadCategory(cat.id)} className={`text-xs font-semibold py-2 px-3 rounded-lg border text-left flex items-center gap-2 transition ${uploadCategory === cat.id ? `${cat.color} border-current ring-1 ring-current` : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}><span>{cat.icon}</span> {cat.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Arquivo PDF</label>
                  <input type="file" accept=".pdf" ref={fileInputRef} className="hidden" onChange={onFileSelect} />
                  <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${selectedFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}`}>
                    {selectedFile ? (<div className="text-green-700"><div className="text-2xl mb-1">📄</div><p className="font-bold text-sm truncate">{selectedFile.name}</p></div>) : (<div className="text-gray-500"><div className="text-2xl mb-1">📤</div><p className="font-medium text-sm">Clique para selecionar PDF</p></div>)}
                  </div>
                </div>
                <button onClick={handleUpload} disabled={!selectedFile || uploading} className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg hover:bg-primary-dark transition disabled:opacity-50">{uploading ? 'Processando...' : 'Enviar e Indexar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}