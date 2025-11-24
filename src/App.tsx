import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ReloadPrompt from './components/ReloadPrompt'
import { Toaster } from 'react-hot-toast'

// Pages Comuns
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import FAQ from './pages/FAQ'
import Despesas from './pages/Despesas'
import Votacoes from './pages/Votacoes'
import Ocorrencias from './pages/Ocorrencias'
import NovaOcorrencia from './pages/NovaOcorrencia'
import Comunicados from './pages/Comunicados'
import Profile from './pages/Profile'
import Suporte from './pages/Suporte'
import NovoChamado from './pages/NovoChamado'
import Comunicacao from './pages/Comunicacao'
import Biblioteca from './pages/Biblioteca'
import Layout from './components/Layout'
import PendingApproval from './pages/PendingApproval'

// Pages Admin
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import OcorrenciasManagement from './pages/admin/OcorrenciasManagement'
import ComunicadosManagement from './pages/admin/ComunicadosManagement'
import VotacoesManagement from './pages/admin/VotacoesManagement'
import FinanceiroManagement from './pages/admin/FinanceiroManagement'
import CondominioManagement from './pages/admin/CondominioManagement' // NOVO IMPORT

// Componente de Proteção de Rota
function PrivateRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { session, loading, profile, canManage } = useAuth()
  const location = useLocation()

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (profile?.role === 'pending') {
    return <Navigate to="/pending-approval" replace />
  }

  if (adminOnly && !canManage) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function PendingRoute({ children }: { children: React.ReactNode }) {
  const { session, loading, profile } = useAuth()

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  if (!session) return <Navigate to="/login" replace />
  if (profile?.role !== 'pending') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ThemeProvider>
          <ReloadPrompt />
          {/* Toaster Global Configurado */}
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '8px',
              },
              success: {
                style: {
                  background: '#ecfdf5',
                  color: '#047857',
                  border: '1px solid #a7f3d0',
                },
                iconTheme: {
                  primary: '#059669',
                  secondary: '#ecfdf5',
                },
              },
              error: {
                style: {
                  background: '#fef2f2',
                  color: '#b91c1c',
                  border: '1px solid #fecaca',
                },
                iconTheme: {
                  primary: '#dc2626',
                  secondary: '#fef2f2',
                },
              },
            }}
          />
          
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Rota de Espera */}
            <Route path="/pending-approval" element={
              <PendingRoute>
                <PendingApproval />
              </PendingRoute>
            } />

            {/* Área do Morador */}
            <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/suporte" element={<Suporte />} />
              <Route path="/comunicacao" element={<Comunicacao />} />
              <Route path="/transparencia" element={<Despesas />} />
              <Route path="/perfil" element={<Profile />} />

              <Route path="/faq" element={<FAQ />} />
              <Route path="/ocorrencias" element={<Ocorrencias />} />
              <Route path="/ocorrencias/nova" element={<NovaOcorrencia />} />
              <Route path="/chamados/novo" element={<NovoChamado />} />
              <Route path="/biblioteca" element={<Biblioteca />} />
              <Route path="/comunicados" element={<Comunicados />} />
              <Route path="/votacoes" element={<Votacoes />} />
              
              <Route path="/despesas" element={<Navigate to="/transparencia" replace />} />
            </Route>

            {/* Área Administrativa */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="usuarios" element={<UserManagement />} />
              <Route path="condominios" element={<CondominioManagement />} /> {/* NOVA ROTA */}
              <Route path="ocorrencias" element={<OcorrenciasManagement />} />
              <Route path="comunicados" element={<ComunicadosManagement />} />
              <Route path="votacoes" element={<VotacoesManagement />} />
              <Route path="financeiro" element={<FinanceiroManagement />} />
              
              <Route path="ia" element={<div className="p-8">Treinamento de IA (Em breve)</div>} />
            </Route>

          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  )
}