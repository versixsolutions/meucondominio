import type { Meta, StoryObj } from '@storybook/react'

const Badge = ({ variant = 'default', size = 'md', children }: any) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
  }
  
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-3 py-1',
    lg: 'text-sm px-4 py-1.5',
  }
  
  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  )
}

const meta = {
  title: 'Components/UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Badges para status, categorias e labels. Cores com contraste WCAG AA.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'danger', 'info', 'purple'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Badge Padrão',
  },
}

export const Success: Story = {
  args: {
    variant: 'success',
    children: '✅ Concluído',
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: '⏳ Pendente',
  },
}

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: '❌ Cancelado',
  },
}

export const Info: Story = {
  args: {
    variant: 'info',
    children: '🔵 Em Análise',
  },
}

export const Purple: Story = {
  args: {
    variant: 'purple',
    children: '📁 Administrativa',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Pequeno',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Grande',
  },
}

export const StatusExamples: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="success">✅ Pago</Badge>
      <Badge variant="warning">⏳ Aberto</Badge>
      <Badge variant="danger">❌ Vencido</Badge>
      <Badge variant="info">🔵 Agendado</Badge>
      <Badge variant="purple">📁 Arquivado</Badge>
      <Badge variant="default">🔘 Rascunho</Badge>
    </div>
  ),
}

export const CategoryExamples: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="purple">📁 Administrativa</Badge>
      <Badge variant="info">👥 Pessoal</Badge>
      <Badge variant="success">🛒 Aquisições</Badge>
      <Badge variant="warning">🔧 Manutenção</Badge>
      <Badge variant="danger">🏛️ Impostos</Badge>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge size="sm">Pequeno</Badge>
      <Badge size="md">Médio</Badge>
      <Badge size="lg">Grande</Badge>
    </div>
  ),
}
