import type { Meta, StoryObj } from '@storybook/react'

const Button = ({ variant = 'primary', size = 'md', children, ...props }: any) => {
  const baseClasses = 'font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
    ghost: 'text-primary hover:bg-primary/10 focus:ring-primary',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}
      {...props}
    >
      {children}
    </button>
  )
}

const meta = {
  title: 'Components/UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Componente de botão com múltiplas variantes, tamanhos e estados. Implementa WCAG 2.1 AA com foco visível.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Botão Primário',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Botão Secundário',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Botão Outline',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Botão Ghost',
  },
}

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Excluir',
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

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Desabilitado',
  },
}

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <span className="mr-2">📥</span>
        Exportar CSV
      </>
    ),
  },
}

export const IconOnly: Story = {
  args: {
    variant: 'ghost',
    size: 'sm',
    children: '✕',
    'aria-label': 'Fechar',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="primary">Primário</Button>
      <Button variant="secondary">Secundário</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Pequeno</Button>
      <Button size="md">Médio</Button>
      <Button size="lg">Grande</Button>
    </div>
  ),
}
