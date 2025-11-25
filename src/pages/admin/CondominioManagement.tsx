import { useState, useRef, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
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
  
  // 1.1 Localização (Atualizado para Plus Code)
  plusCode: '', // Ex: 87Q3+22, Teresina - PI
  
  // 2. Identidade Visual
  primaryColor: '#1F4080',
  secondaryColor: '#00A86B',
  logoUrl: '',
  
  // 3. Estrutura
  totalUnits: '',
  blocks: '', 
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
  const [isSearchingCnpj, setIsSearchingCnpj] = useState(false)
  const [formData, setFormData] = useState(INITIAL_FORM)

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

  // Helper para buscar Plus Code via Nominatim (OpenStreetMap)
  // O Nominatim nem sempre retorna o Plus Code diretamente, então usamos uma lógica simples:
  // Se acharmos Lat/Lon, convertemos (em um cenário real, usaríamos a lib `open-location-code`,
  // mas aqui vamos manter simples buscando o link do Google Maps que gera o Plus Code).
  
  // Workaround para MVP: Vamos buscar Lat/Lon e deixar o link do Google Maps gerar o Plus Code visualmente
  // ou pedir para o usuário colar o Plus Code do Google Maps se o automático falhar.
  
  const fetchLocationData = async (fullAddress: string) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`)
      const data = await response.json()
      
      // Nota: Nominatim não retorna Plus Code nativamente.
      // Para MVP, se acharmos coordenadas, vamos tentar "simular" ou deixar em branco para preenchimento manual.
      // O Google Maps API seria ideal aqui, mas é pago.
      
      if (data && data.length > 0) {
        // Retornamos null no Plus Code para incentivar o preenchimento manual preciso,
        // ou poderíamos usar uma lib JS para converter Lat/Lon -> Plus Code.
        // Vamos focar na UX de pedir o código.
        return null 
      }
    } catch (e) {
      console.warn('Erro ao buscar localização:', e)
    }
    return null
  }

  // --- BUSCA CNPJ VIA BRASILAPI ---
  const handleCnpjSearch = async () => {
    const cleanCnpj = formData.cnpj.replace(/\D/g, '')
    
    if (cleanCnpj.length !== 14) {
      toast.error('CNPJ inválido. Digite apenas números (14 dígitos).')
      return
    }

    setIsSearchingCnpj(true)
    const toastId = toast.loading('Consultando Receita Federal...')

    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`)
      
      if (!response.ok) {
        if (response.status === 404) throw new Error('CNPJ não encontrado.')
        if (response.status === 429) throw new Error('Muitas requisições. Tente novamente em instantes.')
        throw new Error('Erro ao consultar CNPJ.')
      }

      const data = await response.json()

      const addressSimple = `${data.logradouro}, ${data.numero}`
      const addressFull = `${addressSimple}, ${data.bairro}, ${data.municipio} - ${data.uf}`
      const displayName = data.nome_fantasia || data.razao_social
      
      const suggestedSlug = displayName
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, '')

      setFormData(prev => ({
        ...prev,
        razaoSocial: data.razao_social,
        name: displayName,
        address: addressFull,
        city: data.municipio,
        state: data.uf,
        email: data.email || '',
        phone: data.ddd_telefone_1 || '',
        slug: !prev.slug ? suggestedSlug : prev.slug,
        // Plus Code geralmente precisa ser pego manualmente no Maps para precisão
        plusCode: '' 
      }))

      toast.success('Dados preenchidos! Insira o Plus Code manualmente para precisão.', { id: toastId })

    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Falha na consulta', { id: toastId })
    } finally {
      setIsSearchingCnpj(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const toastId = toast.loading('Criando condomínio...')

    try {
      const themeConfig = {
        colors: {
          primary: formData.primaryColor,
          secondary: formData.secondaryColor
        },
        branding: {
          logoUrl: formData.logoUrl || '/assets/logos/versix-solutions-logo.png',
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
          },
          location: {
            plusCode: formData.plusCode // Salva o Plus Code
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
              
              {cond.theme_config?.cadastro?.location?.plusCode && (
                <div className="mb-4 bg-blue-50 p-2 rounded text-center">
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cond.theme_config.cadastro.location.plusCode)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-700 font-mono hover:underline flex items-center justify-center gap-1"
                  >
                    📍 {cond.theme_config.cadastro.location.plusCode}
                  </a>
                </div>
              )}
              
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
          
          {/* SECTION 1: DADOS BÁSICOS VIA API */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-blue-900 text-sm">1. Dados Cadastrais</h4>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1">CNPJ (apenas números)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.cnpj} 
                    onChange={e => setFormData({...formData, cnpj: e.target.value})} 
                    placeholder="00000000000191"
                    maxLength={18}
                  />
                  <button
                    type="button"
                    onClick={handleCnpjSearch}
                    disabled={isSearchingCnpj || !formData.cnpj}
                    className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSearchingCnpj ? '...' : '🔍 Buscar'}
                  </button>
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1">Razão Social</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm bg-white" value={formData.razaoSocial} onChange={e => setFormData({...formData, razaoSocial: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1">Nome Fantasia (Exibição)</label>
                <input required type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Pinheiro Park" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Slug (URL)</label>
                <input required type="text" className="w-full px-3 py-2 border rounded-lg text-sm bg-white font-mono" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s/g, '')})} placeholder="ex: versix" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Telefone</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm bg-white" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1">Endereço Completo</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm bg-white" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              
              {/* PLUS CODE (Substituindo Lat/Lon) */}
              <div className="col-span-2 bg-white p-3 rounded-lg border border-gray-200">
                <label className="block text-xs font-bold text-gray-600 mb-1 flex items-center gap-1">
                  Google Plus Code 
                  <a href="https://plus.codes/map" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-[10px] font-normal ml-1">(Onde encontrar?)</a>
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono uppercase placeholder-gray-300" 
                    value={formData.plusCode} 
                    onChange={e => setFormData({...formData, plusCode: e.target.value.toUpperCase()})} 
                    placeholder="Ex: 87Q3+22 Teresina, PI" 
                  />
                  {formData.plusCode && (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.plusCode)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center"
                      title="Testar Link"
                    >
                      📍
                    </a>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Código curto do Google Maps para localização exata da portaria.</p>
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