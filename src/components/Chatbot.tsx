import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Sou o assistente virtual do Pinheiro Park. 🤖\nPosso tirar dúvidas sobre o Regimento Interno e a Convenção. O que você gostaria de saber?',
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!inputText.trim()) return

    const userText = inputText.trim()
    
    // Adiciona mensagem do usuário
    const newUserMsg: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newUserMsg])
    setInputText('')
    setIsTyping(true)

    // Simula "digitando..." e busca resposta
    try {
      // Busca simples por palavra-chave no banco de dados
      // Em um nível avançado, usaríamos "Embeddings" e IA vetorial aqui
      const { data, error } = await supabase
        .from('faqs')
        .select('question, answer')
        .textSearch('question_answer_vector', userText, { // Assumindo busca textual ou ilike simples abaixo
           type: 'websearch', 
           config: 'portuguese' 
        })
        .limit(1)

      // Fallback para ILIKE se textSearch não estiver configurado no banco ainda
      let answer = ''
      
      if (error || !data || data.length === 0) {
         // Tentativa secundária com ILIKE (mais simples)
         const { data: dataLike } = await supabase
          .from('faqs')
          .select('answer')
          .ilike('question', `%${userText}%`)
          .limit(1)
          
         if (dataLike && dataLike.length > 0) {
           answer = dataLike[0].answer
         } else {
           answer = 'Desculpe, não encontrei essa informação específica no Regimento. Tente reformular sua pergunta (ex: "horário silêncio", "mudanças", "animais").'
         }
      } else {
        answer = data[0].answer
      }

      setTimeout(() => {
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: answer,
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMsg])
        setIsTyping(false)
      }, 1000) // Delay natural

    } catch (err) {
      console.error(err)
      setIsTyping(false)
    }
  }

  return (
    <>
      {/* Botão Flutuante (Fab) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary to-secondary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50"
        >
          <span className="text-3xl">💬</span>
        </button>
      )}

      {/* Janela do Chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-50 h-[500px] animate-fade-in-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-sm">Assistente Virtual</h3>
                <p className="text-xs opacity-80 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-white/80 hover:text-white p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Área de Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-white text-gray-700 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                  <p className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
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
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  )
}