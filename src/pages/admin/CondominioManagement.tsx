import { useState, useRef, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { extractTextFromPDF } from '../../lib/pdfUtils'
import PageLayout from '../../components/PageLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'

interface Condominio {
  id: string
  name: string
  slug: string
  created_at: string
  theme_config: any
}

// Schema inicial do formulário
const INITIAL_FORM = {
  // 1. Cadastrais
  name: '',
  razaoSocial: '',
  cnpj: '',
  slug: '',
  address: '',
  city: '',
  state: '',
  email: '',
  phone: '',
  
  // 2. Identidade Visual
  primaryColor: '#1F4080',
  secondaryColor: '#00A86B',
  logoUrl: '',
  
  // 3. Estrutura
  totalUnits: '',
  blocks: '', // Será convertido em array
  modules: {
    faq: true,
    reservas: false,
    ocorrencias: true,
    votacoes: true,
    financeiro: true
  }
}

export default function CondominioManagement() {
  const [condominios, setCondominios] = useState<Condominio[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProcessingPdf, setIsProcessingPdf] = useState(false)
  const [formData, setFormData] = useState(INITIAL_FORM)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadCondominios()
  }, [])

  async function loadCondominios() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('condominios')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCondominios(data || [])
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao carregar condomínios')
    } finally {
      setLoading(false)
    }
  }

  // --- LÓGICA DE PARSER DA RECEITA FEDERAL ---
  const parseReceitaPDF = (text: string) => {
    console.log("Texto extraído:", text) // Debug

    // Regex simples para capturar campos comuns do Cartão CNPJ
    // Nota: O layout do PDF pode variar, regex busca padrões de chave/valor
    
    const cnpjMatch = text.match(/NÚMERO DE INSCRIÇÃO\s+(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/i)
    const nomeEmpresarialMatch = text.match(/NOME EMPRESARIAL\s+(.*?)\s+TITULO DO ESTABELECIMENTO/i) || text.match(/NOME EMPRESARIAL\s+(.*?)\s+PORTE/i)
    const nomeFantasiaMatch = text.match(/TÍTULO DO ESTABELECIMENTO \(NOME DE FANTASIA\)\s+(.*?)\s+CÓDIGO/i)
    
    // Endereço é mais chato, geralmente está em LOGRADOURO, NÚMERO, BAIRRO...
    const logradouroMatch = text.match(/LOGRADOURO\s+(.*?)\s+NÚMERO/i)
    const numeroMatch = text.match(/NÚMERO\s+(.*?)\s+COMPLEMENTO/i)
    const bairroMatch = text.match(/BAIRRO\/DISTRITO\s+(.*?)\s+MUNICÍPIO/i)
    const municipioMatch = text.match(/MUNICÍPIO\s+(.*?)\s+UF/i)
    const ufMatch = text.match(/UF\s+([A-Z]{2})/i)
    const emailMatch = text.match(/ENDEREÇO ELETRÔNICO\s+(.*?)\s+TELEFONE/i)
    const telefoneMatch = text.match(/TELEFONE\s+(.*?)\s+ENTE FEDERATIVO/i)

    return {
      cnpj: cnpjMatch ? cnpjMatch[1] : '',
      razaoSocial: nomeEmpresarialMatch ? nomeEmpresarialMatch[1].trim() : '',
      name: nomeFantasiaMatch ? nomeFantasiaMatch[1].trim() : (nomeEmpresarialMatch ? nomeEmpresarialMatch[1].trim() : ''),
      address: `${logradouroMatch ? logradouroMatch[1].trim() : ''}, ${numeroMatch ? numeroMatch[1].trim() : ''} - ${bairroMatch ? bairroMatch[1].trim() : ''}`,
      city: municipioMatch ? municipioMatch[1].trim() : '',
      state: ufMatch ? ufMatch[1].trim() : '',
      email: emailMatch ? emailMatch[1].trim().toLowerCase() : '',
      phone: telefoneMatch ? telefoneMatch[1].trim() : ''
    }
  }

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return
    const file = e.target.files[0]
    
    setIsProcessingPdf(true)
    const toastId = toast.loading('Lendo Cartão CNPJ...')

    try {
      const text = await extractTextFromPDF(file)
      const extractedData = parseReceitaPDF(text)

      setFormData(prev => ({
        ...prev,
        ...extractedData,
        // Gera um slug automático se encontrar o nome
        slug: extractedData.name 
          ? extractedData.name.toLowerCase().replace(/[^a-z0-9]/g, '') 
          : prev.slug
      }))

      toast.success('Dados extraídos com sucesso!', { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error('Não foi possível ler o PDF. Verifique se é um arquivo válido.', { id: toastId })
    } finally {
      setIsProcessingPdf(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const toastId = toast.loading('Criando condomínio...')

    try {
      // Montar o JSON de configuração
      const themeConfig = {
        colors: {
          primary: formData.primaryColor,
          secondary: formData.secondaryColor
        },
        branding: {
          logoUrl: formData.logoUrl || '/assets/logos/versix-solutions-logo.png', // Fallback
        },
        modules: formData.modules,
        structure: {
          totalUnits: parseInt(formData.totalUnits) || 0,
          blocks: formData.blocks.split(',').map(b => b.trim()).filter(Boolean)
        },
        cadastro: {
          cnpj: formData.cnpj,
          razaoSocial: formData.razaoSocial,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          contact: {
            email: formData.email,
            phone: formData.phone
          }
        }
      }

      const { error } = await supabase.from('condominios').insert({
        name: formData.name,
        slug: formData.slug,
        theme_config: themeConfig
      })

      if (error) throw error

      toast.success('Condomínio criado com sucesso!', { id: toastId })
      setIsModalOpen(false)
      setFormData(INITIAL_FORM)
      loadCondominios()

    } catch (error: any) {
      toast.error('Erro ao criar: ' + error.message, { id: toastId })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Condomínios</h1>
          <p className="text-gray-500 text-sm">Gerencie os clientes e tenants do sistema.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-primary-dark transition flex items-center gap-2"
        >
          <span>+</span> Novo Condomínio
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : condominios.length === 0 ? (
        <EmptyState icon="🏢" title="Nenhum condomínio" description="Cadastre o primeiro cliente para começar." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {condominios.map((cond) => (
            <div key={cond.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition group">
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                  🏢
                </div>
                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded border border-blue-100">
                  {cond.slug}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">{cond.name}</h3>
              <p className="text-xs text-gray-500 mb-4 truncate">
                {cond.theme_config?.cadastro?.address || 'Endereço não informado'}
              </p>
              
              <div className="flex gap-2 border-t border-gray-100 pt-3">
                <button className="flex-1 text-xs font-bold text-gray-600 hover:bg-gray-50 py-2 rounded">
                  Editar
                </button>
                <button className="flex-1 text-xs font-bold text-blue-600 hover:bg-blue-50 py-2 rounded">
                  Acessar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE CRIAÇÃO */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Condomínio"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1: IMPORTAÇÃO E DADOS BÁSICOS */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-blue-900 text-sm">1. Dados Cadastrais</h4>
              
              {/* BOTÃO MÁGICO DE UPLOAD */}
              <div>
                <input 
                  type="file" 
                  accept=".pdf" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handlePdfUpload} 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingPdf}
                  className="bg-white text-blue-600 text-xs font-bold px-3 py-1.5 rounded border border-blue-200 hover:bg-blue-50 transition flex items-center gap-2 shadow-sm"
                >
                  {isProcessingPdf ? 'Lendo...' : '📄 Importar Cartão CNPJ'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1">Nome Fantasia (Exibição)</label>
                <input required type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Pinheiro Park" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1">Razão Social</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm bg-white" value={formData.razaoSocial} onChange={e => setFormData({...formData, razaoSocial: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">CNPJ</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm bg-white" value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Slug (URL)</label>
                <input required type="text" className="w-full px-3 py-2 border rounded-lg text-sm bg-white font-mono" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s/g, '')})} placeholder="ex: versix" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1">Endereço Completo</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm bg-white" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Cidade</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm bg-white" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">UF</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm bg-white" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
              </div>
            </div>
          </div>

          {/* SECTION 2: VISUAL */}
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-3">2. Identidade Visual</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Cor Primária</label>
                <div className="flex gap-2">
                  <input type="color" className="h-9 w-9 rounded cursor-pointer border border-gray-200" value={formData.primaryColor} onChange={e => setFormData({...formData, primaryColor: e.target.value})} />
                  <input type="text" className="flex-1 px-3 py-2 border rounded-lg text-sm uppercase" value={formData.primaryColor} onChange={e => setFormData({...formData, primaryColor: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Cor Secundária</label>
                <div className="flex gap-2">
                  <input type="color" className="h-9 w-9 rounded cursor-pointer border border-gray-200" value={formData.secondaryColor} onChange={e => setFormData({...formData, secondaryColor: e.target.value})} />
                  <input type="text" className="flex-1 px-3 py-2 border rounded-lg text-sm uppercase" value={formData.secondaryColor} onChange={e => setFormData({...formData, secondaryColor: e.target.value})} />
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1">Logo URL</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="https://..." value={formData.logoUrl} onChange={e => setFormData({...formData, logoUrl: e.target.value})} />
              </div>
            </div>
          </div>

          {/* SECTION 3: ESTRUTURA & MÓDULOS */}
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-3">3. Configuração</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Total Unidades</label>
                <input type="number" className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.totalUnits} onChange={e => setFormData({...formData, totalUnits: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Blocos (sep. vírgula)</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="A, B, C..." value={formData.blocks} onChange={e => setFormData({...formData, blocks: e.target.value})} />
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Módulos Ativos</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(formData.modules).map((key) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-primary rounded"
                      checked={(formData.modules as any)[key]}
                      onChange={e => setFormData({
                        ...formData, 
                        modules: { ...formData.modules, [key]: e.target.checked }
                      })}
                    />
                    <span className="text-sm capitalize">{key}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50">Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark shadow-lg">Criar Condomínio</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}