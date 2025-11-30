import type { Meta, StoryObj } from '@storybook/react'
import Tooltip from './Tooltip'

const meta = {
  title: 'Components/UI/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Tooltip acessível usando Radix UI. Suporta hover, foco via teclado e múltiplas posições. Implementa WCAG 2.1 AA.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    content: {
      control: 'text',
      description: 'Conteúdo do tooltip',
    },
    side: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Posição do tooltip relativo ao elemento',
    },
  },
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    content: 'Este é um tooltip informativo',
    children: (
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
        Hover aqui
      </button>
    ),
  },
}

export const Top: Story = {
  args: {
    content: 'Tooltip posicionado acima',
    side: 'top',
    children: (
      <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
        Tooltip Acima
      </button>
    ),
  },
}

export const Right: Story = {
  args: {
    content: 'Tooltip à direita',
    side: 'right',
    children: (
      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
        Tooltip Direita
      </button>
    ),
  },
}

export const Bottom: Story = {
  args: {
    content: 'Tooltip posicionado abaixo',
    side: 'bottom',
    children: (
      <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
        Tooltip Abaixo
      </button>
    ),
  },
}

export const Left: Story = {
  args: {
    content: 'Tooltip à esquerda',
    side: 'left',
    children: (
      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
        Tooltip Esquerda
      </button>
    ),
  },
}

export const OnIcon: Story = {
  args: {
    content: 'Exportar dados para CSV',
    side: 'top',
    children: (
      <button className="p-2 rounded-lg hover:bg-gray-100 transition" aria-label="Exportar">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </button>
    ),
  },
}

export const LongContent: Story = {
  args: {
    content: 'Este tooltip contém uma explicação mais longa que pode quebrar em múltiplas linhas para fornecer contexto adicional.',
    side: 'top',
    children: (
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
        Info Detalhada
      </button>
    ),
  },
}

export const OnBadge: Story = {
  args: {
    content: 'Status: Processamento pendente',
    side: 'top',
    children: (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 cursor-help">
        ⏳ Pendente
      </span>
    ),
  },
}
