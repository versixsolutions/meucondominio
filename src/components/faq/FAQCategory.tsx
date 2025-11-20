import { useState } from 'react'
import FAQCard from './FAQCard'

interface FAQ {
  id: string
  question: string
  answer: string
  helpful_count: number
  not_helpful_count: number
}

interface FAQCategoryProps {
  id: string
  name: string
  icon: string
  faqs: FAQ[]
  isSindico?: boolean
  onEditFAQ?: (id: string) => void
  onDeleteFAQ?: (id: string) => void
}

export default function FAQCategory({ 
  id, 
  name, 
  icon, 
  faqs,
  isSindico = false,
  onEditFAQ,
  onDeleteFAQ
}: FAQCategoryProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
            {icon}
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{faqs.length} perguntas</p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-gray-200 p-4">
          {faqs.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhuma FAQ nesta categoria ainda.</p>
          ) : (
            faqs.map((faq) => (
              <FAQCard
                key={faq.id}
                id={faq.id}
                question={faq.question}
                answer={faq.answer}
                helpfulCount={faq.helpful_count}
                notHelpfulCount={faq.not_helpful_count}
                isSindico={isSindico}
                onEdit={onEditFAQ}
                onDelete={onDeleteFAQ}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
