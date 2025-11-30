/**
 * ONBOARDING TOUR - Tour Interativo de Boas-Vindas
 * Guia novos usuários pelos recursos principais da aplicação
 */

import { useState, useEffect } from 'react'
import Joyride, { STATUS } from 'react-joyride'
import type { CallBackProps, Step } from 'react-joyride'

interface OnboardingTourProps {
  isNewUser?: boolean
}

const tourSteps: Step[] = [
  {
    target: 'body',
    content: (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-2">🎉 Bem-vindo ao Versix Norma!</h2>
        <p className="text-gray-600 leading-relaxed">
          Vamos fazer um tour rápido para você conhecer os principais recursos da plataforma.
          Isso levará apenas 2 minutos!
        </p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="dashboard-stats"]',
    content: (
      <div>
        <h3 className="font-bold text-lg mb-2">📊 Dashboard de Estatísticas</h3>
        <p className="text-gray-600">
          Aqui você acompanha em tempo real: chamados abertos, votações ativas, 
          documentos importantes e avisos do condomínio.
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="suporte-menu"]',
    content: (
      <div>
        <h3 className="font-bold text-lg mb-2">🤝 Suporte e Chamados</h3>
        <p className="text-gray-600">
          Precisa reportar um problema ou pedir ajuda? Clique aqui para abrir chamados
          e acompanhar o andamento das suas solicitações.
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="chatbot-button"]',
    content: (
      <div>
        <h3 className="font-bold text-lg mb-2">👩‍💻 Conheça a Norma</h3>
        <p className="text-gray-600">
          Nossa assistente virtual está sempre disponível para responder suas dúvidas,
          buscar informações e ajudar com tarefas comuns. Clique no botão "N" para conversar!
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tour="transparency"]',
    content: (
      <div>
        <h3 className="font-bold text-lg mb-2">💰 Transparência Financeira</h3>
        <p className="text-gray-600">
          Acompanhe todas as despesas, receitas e documentos financeiros do condomínio.
          Total transparência para você!
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tour="keyboard-shortcuts"]',
    content: (
      <div>
        <h3 className="font-bold text-lg mb-2">⌨️ Atalhos de Teclado</h3>
        <p className="text-gray-600 mb-3">
          Economize tempo com atalhos:
        </p>
        <ul className="text-sm space-y-1 text-gray-600">
          <li><kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Alt + 1</kbd> Dashboard</li>
          <li><kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Alt + S</kbd> Suporte</li>
          <li><kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Alt + N</kbd> Chat Norma</li>
          <li><kbd className="px-2 py-1 bg-gray-100 rounded text-xs">?</kbd> Ver todos os atalhos</li>
        </ul>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: 'body',
    content: (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-2">🚀 Tudo pronto!</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Agora você está por dentro dos principais recursos. Explore à vontade!
        </p>
        <p className="text-sm text-gray-500">
          💡 Dica: Você pode rever este tour a qualquer momento clicando em "Ajuda" no menu.
        </p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
]

export default function OnboardingTour({ isNewUser = false }: OnboardingTourProps) {
  const [run, setRun] = useState(false)

  useEffect(() => {
    // Verifica se o usuário já viu o tour
    const hasSeenTour = localStorage.getItem('hasSeenOnboardingTour')
    
    if (!hasSeenTour && isNewUser) {
      // Aguarda 1 segundo após o carregamento para iniciar o tour
      const timer = setTimeout(() => {
        setRun(true)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [isNewUser])

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data
    
    // Tour finalizado ou pulado
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false)
      localStorage.setItem('hasSeenOnboardingTour', 'true')
      localStorage.setItem('onboardingCompletedAt', new Date().toISOString())
    }
  }

  // Função para reiniciar o tour (chamada externamente)
  const restartTour = () => {
    setRun(true)
  }

  // Expõe a função para reiniciar o tour
  useEffect(() => {
    (window as any).restartOnboardingTour = restartTour
    return () => {
      delete (window as any).restartOnboardingTour
    }
  }, [])

  return (
    <Joyride
      steps={tourSteps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#1F4080',
          textColor: '#333',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 12,
          fontSize: 15,
        },
        buttonNext: {
          backgroundColor: '#1F4080',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          padding: '10px 20px',
        },
        buttonBack: {
          color: '#666',
          fontSize: 14,
          fontWeight: 600,
        },
        buttonSkip: {
          color: '#999',
          fontSize: 13,
        },
      }}
      locale={{
        back: 'Voltar',
        close: 'Fechar',
        last: 'Finalizar',
        next: 'Próximo',
        skip: 'Pular tour',
      }}
    />
  )
}

/**
 * Hook para controlar o tour programaticamente
 */
export function useOnboardingTour() {
  const startTour = () => {
    localStorage.removeItem('hasSeenOnboardingTour')
    if ((window as any).restartOnboardingTour) {
      (window as any).restartOnboardingTour()
    }
  }

  const hasSeenTour = () => {
    return localStorage.getItem('hasSeenOnboardingTour') === 'true'
  }

  return { startTour, hasSeenTour }
}
