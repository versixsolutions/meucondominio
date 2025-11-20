interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-xl p-8 md:p-12 text-center shadow-sm border border-gray-200">
      <div className="text-6xl md:text-8xl mb-4">{icon}</div>
      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
