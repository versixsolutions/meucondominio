import { memo, ReactNode } from 'react'

type EmptyAction = {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

interface EmptyStateProps {
  icon?: string
  illustration?: ReactNode
  title: string
  description: string
  suggestion?: string
  actions?: EmptyAction[]
  action?: { label: string; onClick: () => void } // backward compatibility
  variant?: 'default' | 'dashboard' | 'financial' | 'occurrences' | 'chamados' | 'faq' | 'documents' | 'votacoes' | 'transparency'
}

const VARIANT_SUGGESTIONS: Record<string, string> = {
  dashboard: 'Adicione ações recentes para que o painel mostre atividade.',
  financial: 'Verifique filtros ou período selecionado.',
  occurrences: 'Registre uma nova ocorrência para acompanhamento.',
  chamados: 'Abra um chamado para que possamos ajudar.',
  faq: 'Tente buscar palavras-chave diferentes ou abra o chatbot.',
  documents: 'Envie o primeiro documento para criar histórico.',
  votacoes: 'Crie uma nova pauta para iniciar uma votação.',
  transparency: 'Sem dados neste intervalo. Ajuste o mês ou filtro.'
}

function EmptyState({
  icon = '📝',
  illustration,
  title,
  description,
  suggestion,
  actions,
  action,
  variant = 'default'
}: EmptyStateProps) {
  const resolvedActions: EmptyAction[] = actions || (action ? [{ ...action, variant: 'primary' }] : [])
  const finalSuggestion = suggestion || (variant !== 'default' ? VARIANT_SUGGESTIONS[variant] : undefined)
  const titleId = `empty-state-title-${title.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <section
      aria-labelledby={titleId}
      role="status"
      aria-live="polite"
      className="bg-white rounded-xl p-8 md:p-12 text-center shadow-sm border border-gray-200 flex flex-col items-center"
    >
      <div className="mb-4">
        {illustration ? (
          <div className="mx-auto w-32 h-32 flex items-center justify-center" aria-hidden="true">{illustration}</div>
        ) : (
          <div className="text-6xl md:text-8xl" aria-hidden="true">{icon}</div>
        )}
      </div>
      <h3 id={titleId} className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 max-w-md mx-auto">{description}</p>
      {finalSuggestion && (
        <p className="text-xs text-gray-400 mb-6 max-w-xs mx-auto" data-empty-suggestion>{finalSuggestion}</p>
      )}
      {resolvedActions.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3">
          {resolvedActions.map((a, idx) => (
            <button
              key={idx}
              onClick={a.onClick}
              className={
                a.variant === 'secondary'
                  ? 'px-5 py-2.5 rounded-lg font-semibold text-primary border border-primary/40 hover:bg-primary/5 transition text-sm'
                  : 'px-5 py-2.5 rounded-lg font-semibold bg-primary text-white hover:bg-primary-dark transition text-sm'
              }
              aria-label={a.label}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

export default memo(EmptyState)
