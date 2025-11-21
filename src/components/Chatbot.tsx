import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// Tipos para suportar botões de ação no chat
interface ChatOption {
  label: string
  value: string
  type: 'category' | 'question'
}

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  isError?: boolean
  options?: ChatOption[] // Botões opcionais na mensagem
}

interface ChatbotProps {
  isOpen: boolean
  onClose: () => void
}

export default function Chatbot({ isOpen, onClose }: ChatbotProps) {
  const { profile } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  // Auto-scroll
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  // Inicialização da Saudação Humanizada (Roda apenas 1 vez ao abrir)
  useEffect(() => {
    if (isOpen && !initialized.current) {
      startConversation()
      initialized.current = true
    }
  }, [isOpen])

  async function startConversation() {
    setIsTyping(true)
    
    // 1. Determinar saudação baseada na hora
    const hour = new Date().getHours()
    let greeting = 'Bom dia'
    if (hour >= 12) greeting = 'Boa tarde'
    if (hour >= 18) greeting = 'Boa noite'

    // 2. Pegar primeiro nome do usuário
    const firstName = profile?.full_name?.split(' ')[0] || 'Morador'

    // 3. Buscar categorias disponíveis no banco para gerar opções
    const { data: categories } = await supabase
      .from('faqs')
      .select('category')
    
    // Filtra categorias únicas e formata
    const uniqueCategories = Array.from(new Set(categories?.map(c => c.category))).sort()
    const categoryOptions: ChatOption[] = uniqueCategories.map(cat => ({
      label: cat,
      value: cat,
      type: 'category'
    }))

    setTimeout(() => {
      setMessages([
        {
          id: 'welcome',
          text: `${greeting}, ${firstName}, tudo bem? \n\nMe chamo **Ísis**, sua assistente virtual da Versix, e estou aqui para ajudá-lo. 😊\n\nVocê pode digitar sua dúvida ou escolher um dos temas abaixo para começarmos:`,
          sender: 'bot',
          timestamp: new Date(),
          options: categoryOptions
        }
      ])
      setIsTyping(false)
    }, 1000)
  }

  // Lida com clique nos botões (Opções)
  async function handleOptionClick(option: ChatOption) {
    // Adiciona a escolha do usuário como uma mensagem enviada por ele
    const userMsg: Message = {
      id: Date.now().toString(),
      text: option.label,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    if (option.type === 'category') {
      // Se clicou em categoria, busca as perguntas dessa categoria
      await fetchQuestionsByCategory(option.value)
    } else if (option.type === 'question') {
      // Se clicou em pergunta, busca a resposta
      await fetchAnswerById(option.value)
    }
  }

  async function fetchQuestionsByCategory(category: string) {
    try {
      const { data } = await supabase
        .from('faqs')
        .select('id, question')
        .eq('category', category)
        .limit(5) // Limita para não poluir o chat

      const questionOptions: ChatOption[] = data?.map(q => ({
        label: q.question,
        value: q.id,
        type: 'question'
      })) || []

      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: `Entendido! Aqui estão as dúvidas mais comuns sobre **${category}**:`,
          sender: 'bot',
          timestamp: new Date(),
          options: questionOptions
        }])
        setIsTyping(false)
      }, 800)
    } catch (error) {
      console.error(error)
      setIsTyping(false)
    }
  }

  async function fetchAnswerById(questionId: string) {
    try {
      const { data } = await supabase
        .from('faqs')
        .select('answer')
        .eq('id', questionId)
        .single()

      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: data?.answer || 'Desculpe, não consegui carregar a resposta.',
          sender: 'bot',
          timestamp: new Date()
        }])
        
        // Oferece voltar ao menu após responder
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now().toString() + '_return',
            text: 'Posso ajudar em algo mais?',
            sender: 'bot',
            timestamp: new Date(),
            options: [{ label: 'Voltar ao Início', value: 'restart', type: 'category' }] // Truque: type category com valor restart poderia reiniciar
          }])
        }, 1000)
        
        setIsTyping(false)
      }, 800)
    } catch (error) {
      console.error(error)
      setIsTyping(false)
    }
  }

  // Lida com envio de texto livre (Busca Híbrida)
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!inputText.trim()) return

    const userText = inputText.trim()
    
    const newUserMsg: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newUserMsg])
    setInputText('')
    setIsTyping(true)

    try {
      // 1. Busca em FAQs (Palavra-chave)
      const { data: faqData } = await supabase
        .from('faqs')
        .select('question, answer')
        .ilike('question', `%${userText}%`)
        .limit(1)

      let botResponse = ''

      if (faqData && faqData.length > 0) {
        botResponse = `Encontrei algo relacionado:\n\n${faqData[0].answer}`
      } else {
        // 2. Busca nos Documentos (Regimento)
        const { data: docData } = await supabase
          .from('documents')
          .select('content')
          .ilike('content', `%${userText}%`)
          .limit(1)

        if (docData && docData.length > 0) {
          botResponse = `Consultei o Regimento e encontrei:\n\n"${docData[0].content}"`
        } else {
          botResponse = 'Não encontrei uma resposta exata nos documentos oficiais. Tente selecionar um tema abaixo ou reformular sua pergunta.'
        }
      }

      setTimeout(() => {
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: botResponse,
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMsg])
        setIsTyping(false)
      }, 1000) 

    } catch (err) {
      console.error('Erro no chat:', err)
      setIsTyping(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-50 h-[500px] animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-3 text-white flex justify-between items-center cursor-pointer" onClick={onClose}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl backdrop-blur-sm shadow-inner">
            👩‍💻
          </div>
          <div>
            <h3 className="font-bold text-sm">Ísis - Assistente Versix</h3>
            <p className="text-[10px] opacity-90 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
            </p>
          </div>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }} 
          className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Balão de Texto */}
            <div
              className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-primary text-white rounded-br-none'
                  : 'bg-white text-gray-700 border border-gray-200 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-line leading-relaxed">
                {msg.text.split('**').map((chunk, i) => 
                  i % 2 === 1 ? <strong key={i}>{chunk}</strong> : chunk
                )}
              </p>
              <p className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Botões de Opções (se houver) */}
            {msg.options && (
              <div className="flex flex-wrap gap-2 mt-2 max-w-[90%] animate-fade-in">
                {msg.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => opt.value === 'restart' ? startConversation() : handleOptionClick(opt)}
                    className="bg-white border border-primary text-primary text-xs font-bold px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition shadow-sm"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none flex gap-1 items-center shadow-sm">
              <span className="text-[10px] text-gray-400 mr-2 font-medium">Ísis está digitando</span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Digite sua dúvida..."
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isTyping}
          className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
        >
          <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  )
}