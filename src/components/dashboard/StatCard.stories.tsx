import type { Meta, StoryObj } from '@storybook/react'
import { StatCard } from './dashboard/StatCard'

const meta = {
  title: 'Components/Dashboard/StatCard',
  component: StatCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Card de estatística para dashboard com tooltip de tendência e memoização para performance.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Título da estatística',
    },
    value: {
      control: 'text',
      description: 'Valor principal',
    },
    icon: {
      control: 'text',
      description: 'Emoji do ícone',
    },
    trend: {
      control: 'select',
      options: ['up', 'down', 'neutral'],
      description: 'Tendência da métrica',
    },
    trendValue: {
      control: 'text',
      description: 'Valor da tendência (ex: +12%)',
    },
  },
} satisfies Meta<typeof StatCard>

export default meta
type Story = StoryObj<typeof meta>

export const Positive: Story = {
  args: {
    title: 'Chamados Resolvidos',
    value: '42',
    icon: '✅',
    trend: 'up',
    trendValue: '+12%',
  },
}

export const Negative: Story = {
  args: {
    title: 'Ocorrências Pendentes',
    value: '8',
    icon: '⚠️',
    trend: 'down',
    trendValue: '-5%',
  },
}

export const Neutral: Story = {
  args: {
    title: 'Votações Ativas',
    value: '3',
    icon: '🗳️',
    trend: 'neutral',
    trendValue: '0%',
  },
}

export const WithoutTrend: Story = {
  args: {
    title: 'Total de Moradores',
    value: '156',
    icon: '👥',
  },
}

export const Financial: Story = {
  args: {
    title: 'Despesas Pagas',
    value: 'R$ 45.280',
    icon: '💰',
    trend: 'up',
    trendValue: '+8%',
  },
}

export const LargeNumber: Story = {
  args: {
    title: 'Documentos na Biblioteca',
    value: '1.234',
    icon: '📚',
    trend: 'up',
    trendValue: '+156',
  },
}
