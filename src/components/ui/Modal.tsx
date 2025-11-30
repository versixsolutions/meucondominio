import { ReactNode } from 'react'
import Tooltip from './Tooltip'
import { useFocusTrap, useEscapeKey, useBodyScrollLock } from '../../hooks/useKeyboardNavigation'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const containerRef = useFocusTrap(isOpen)
  useEscapeKey(isOpen, onClose)
  useBodyScrollLock(isOpen)
  
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      aria-hidden="true"
    >
      <div 
        ref={containerRef}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 id="modal-title" className="text-xl font-bold text-gray-900">{title}</h3>
          <Tooltip content="Fechar" side="left">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100"
              aria-label="Fechar modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </Tooltip>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}