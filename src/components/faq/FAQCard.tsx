import { useState } from 'react'
import { supabase } from '../../lib/supabase'

interface FAQCardProps {
  id: string
  question: string
  answer: string
  helpfulCount: number
  notHelpfulCount: number
  isSindico?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export default function FAQCard({ 
  id, 
  question, 
  answer, 
  helpfulCount: initialHelpful,
  notHelpfulCount: initialNotHelpful,
  isSindico = false,
  onEdit,
  onDelete
}: FAQCardProps) {
  const [helpful, setHelpful] = useState(initialHelpful)
  const [notHelpful, setNotHelpful] = useState(initialNotHelpful)
  const [voted, setVoted] = useState(false)

  const handleVote = async (isHelpful: boolean) => {
    if (voted) return

    try {
      const field = isHelpful ? 'helpful_count' : 'not_helpful_count'
      const newValue = isHelpful ? helpful + 1 : notHelpful + 1

      const { error } = await supabase
        .from('faqs')
        .update({ [field]: newValue })
        .eq('id', id)

      if (error) throw error

      if (isHelpful) {
        setHelpful(newValue)
      } else {
        setNotHelpful(newValue)
      }
      
      setVoted(true)
    } catch (error) {
      console.error('Erro ao votar:', error)
    }
  }

  return (
    <div className="faq-item py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="font-semibold text-gray-900 flex-1">
          {question}
        </p>
        
        {/* Botões Admin */}
        {isSindico && (
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => onEdit?.(id)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              title="Editar FAQ"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete?.(id)}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
              title="Deletar FAQ"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-3">
        {answer}
      </p>

      <div className="flex gap-4 text-xs">
        <button
          onClick={() => handleVote(true)}
          disabled={voted}
          className={`transition ${
            voted 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-green-600 hover:text-green-700'
          }`}
        >
          👍 Útil ({helpful})
        </button>
        <button
          onClick={() => handleVote(false)}
          disabled={voted}
          className={`transition ${
            voted 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          👎 Não útil ({notHelpful})
        </button>
      </div>
    </div>
  )
}
