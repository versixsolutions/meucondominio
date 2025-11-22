import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/ui/Modal' // Reutilizando o Modal existente
import { useAuth } from '../../contexts/AuthContext'

interface UserData {
  id: string
  email: string
  full_name: string
  role: string
  unit_number: string
  phone: string
  created_at: string
}

// Opções de Níveis de Acesso
const ROLES = [
  { value: 'morador', label: 'Morador' },
  { value: 'conselho', label: 'Conselho Fiscal' },
  { value: 'sub_sindico', label: 'Sub-Síndico' },
  { value: 'sindico', label: 'Síndico' },
  { value: 'admin', label: 'Administrador (Super)' },
  { value: 'portaria', label: 'Portaria' }
]

export default function UserManagement() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'active'>('pending')
  const [processingId, setProcessingId] = useState<string | null>(null)
  
  // Estados para Edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  // --- AÇÕES DE APROVAÇÃO/REJEIÇÃO (PENDENTES) ---

  async function handleApprove(id: string) {
    if (!confirm('Confirmar aprovação deste morador?')) return
    setProcessingId(id)
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: 'morador' }) // Padrão ao aprovar é morador
        .eq('id', id)

      if (error) throw error
      
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: 'morador' } : u))
    } catch (error: any) {
      alert('Erro: ' + error.message)
    } finally {
      setProcessingId(null)
    }
  }

  async function handleReject(id: string) {
    if (!confirm('Tem certeza? Isso removerá o cadastro.')) return
    setProcessingId(id)
    try {
      const { error } = await supabase.from('users').delete().eq('id', id)
      if (error) throw error
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (error: any) {
      alert('Erro: ' + error.message)
    } finally {
      setProcessingId(null)
    }
  }

  // --- AÇÕES DE EDIÇÃO (ATIVOS) ---

  function openEditModal(user: UserData) {
    setEditingUser({ ...user }) // Cria uma cópia para editar
    setIsEditModalOpen(true)
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingUser) return

    setProcessingId(editingUser.id)
    try {
      // Proteção: Não permitir que eu edite meu próprio papel para algo menor que admin e me tranque fora
      if (editingUser.id === currentUser?.id && editingUser.role !== 'admin' && editingUser.role !== 'sindico') {
         if(!confirm('ATENÇÃO: Você está rebaixando seu próprio nível de acesso. Você pode perder acesso a esta tela. Continuar?')) {
            setProcessingId(null)
            return
         }
      }

      const { error } = await supabase
        .from('users')
        .update({
          full_name: editingUser.full_name,
          unit_number: editingUser.unit_number,
          phone: editingUser.phone,
          role: editingUser.role
        })
        .eq('id', editingUser.id)

      if (error) throw error

      // Atualiza a lista local
      setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u))
      setIsEditModalOpen(false)
      setEditingUser(null)
      alert('Dados atualizados com sucesso!')

    } catch (error: any) {
      alert('Erro ao salvar: ' + error.message)
    } finally {
      setProcessingId(null)
    }
  }

  const filteredUsers = users.filter(u => {
    if (filter === 'pending') return u.role === 'pending'
    if (filter === 'active') return u.role !== 'pending'
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header e Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h1>
          <p className="text-gray-500 text-sm">Administre permissões e cadastros.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition ${filter === 'pending' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Pendentes ({users.filter(u => u.role === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition ${filter === 'active' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Ativos ({users.filter(u => u.role !== 'pending').length})
          </button>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredUsers.length === 0 ? (
        <EmptyState 
          icon={filter === 'pending' ? '✅' : '👥'} 
          title={filter === 'pending' ? 'Tudo limpo!' : 'Nenhum usuário'} 
          description={filter === 'pending' ? 'Não há cadastros pendentes de aprovação.' : 'Nenhum usuário ativo encontrado.'} 
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">Unidade</th>
                  <th className="px-6 py-4">Nível (Role)</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 text-sm">{user.full_name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{user.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono text-xs font-bold border border-gray-200">
                        {user.unit_number || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {/* Badge de Role */}
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                        user.role === 'pending' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                        user.role === 'admin' ? 'bg-red-100 text-red-800 border-red-200' :
                        user.role === 'sindico' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                        user.role === 'conselho' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        'bg-green-100 text-green-800 border-green-200'
                      }`}>
                        {user.role === 'sub_sindico' ? 'Sub-Síndico' : user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleReject(user.id)} disabled={!!processingId} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Rejeitar">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                          <button onClick={() => handleApprove(user.id)} disabled={!!processingId} className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition shadow-sm">
                            Aprovar
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => openEditModal(user)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1.5 hover:bg-blue-50 rounded-lg transition"
                        >
                          Editar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Usuário"
      >
        {editingUser && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={editingUser.full_name}
                onChange={e => setEditingUser({ ...editingUser, full_name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editingUser.unit_number}
                  onChange={e => setEditingUser({ ...editingUser, unit_number: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editingUser.phone || ''}
                  onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Acesso (Role)</label>
              <div className="relative">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                  value={editingUser.role}
                  onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                >
                  {ROLES.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ Cuidado ao promover usuários para 'Admin' ou 'Síndico'. Eles terão acesso total ao sistema.
              </p>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!!processingId}
                className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md"
              >
                {processingId ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}