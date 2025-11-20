// src/types/index.ts

// ============================================
// TIPOS GERAIS (User & Condominio)
// ============================================

export interface Condominio {
  id: string
  name: string
  slug: string
  theme_config: any
}

export interface User {
  id: string
  email: string
  role: 'sindico' | 'morador' | 'admin' | 'pending'
  full_name: string
  unit_number: string | null
  phone: string | null
  condominio_id: string | null
  condominio_name?: string // Adicionado para facilitar o uso no frontend
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  helpful_count: number
}

// ============================================
// TIPOS: FEED FINANCEIRO
// ============================================

export interface DespesaCategory {
  id: string
  name: string
  icon: string | null
  color: string | null
  order_index: number
}

export interface Despesa {
  id: string
  title: string
  description: string | null
  amount: number
  category_id: string | null
  payment_date: string
  receipt_url: string | null
  receipt_filename: string | null
  notes: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  // Campos virtuais/Joined
  category?: DespesaCategory
  category_name?: string // Caso precise de compatibilidade simples
}

export interface DespesasStats {
  total: number
  count: number
  biggestCategory: string
  biggestAmount: number
  comparisonPrevMonth: number
}

// ============================================
// TIPOS: VOTAÇÕES
// ============================================

export interface Votacao {
  id: string
  title: string
  description: string
  details: string | null
  start_date: string
  end_date: string
  status: 'ativa' | 'encerrada' | 'cancelada'
  quorum_required: number
  total_voters: number
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface Voto {
  id: string
  votacao_id: string
  user_id: string | null
  vote_type: 'favor' | 'contra' | 'abstencao'
  voted_at: string
}

export interface VotacaoStats {
  total_votes: number
  votes_favor: number
  votes_contra: number
  votes_abstencao: number
  participation_rate: number
}

export interface VotacaoWithStats extends Votacao {
  stats: VotacaoStats
}

// ============================================
// TIPOS: OCORRÊNCIAS
// ============================================

export interface Ocorrencia {
  id: string
  title: string
  description: string
  location: string | null
  priority: 'baixa' | 'normal' | 'urgente'
  status: 'aberto' | 'em_andamento' | 'resolvido' | 'cancelado'
  photo_before_url: string | null
  photo_after_url: string | null
  resolution_notes: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  resolved_by: string | null
}

export interface OcorrenciaUpdate {
  id: string
  ocorrencia_id: string
  message: string
  old_status: string | null
  new_status: string | null
  created_by: string | null
  created_at: string
}

export interface OcorrenciaWithUpdates extends Ocorrencia {
  updates: OcorrenciaUpdate[]
}

export interface OcorrenciasStats {
  abertas: number
  em_andamento: number
  resolvidas_mes: number
  total: number
}

// ============================================
// TIPOS: COMUNICADOS
// ============================================

export interface Comunicado {
  id: string
  title: string
  content: string
  type: 'assembleia' | 'urgente' | 'importante' | 'informativo'
  priority: number
  published_at: string
  created_at: string
  updated_at: string
  created_by: string | null
  is_read?: boolean // Adicionado para compatibilidade frontend
}

export interface ComunicadoAttachment {
  id: string
  comunicado_id: string
  filename: string
  file_url: string
  file_size: number | null
  file_type: string | null
  created_at: string
}

export interface ComunicadoRead {
  id: string
  comunicado_id: string
  user_id: string | null
  read_at: string
}

export interface ComunicadoWithDetails extends Comunicado {
  attachments: ComunicadoAttachment[]
  is_read: boolean
}