import type { Meta, StoryObj } from '@storybook/react'
import EmptyState from './EmptyState'

const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Componente de estado vazio com variantes contextuais, sugestões e múltiplas ações. Suporta acessibilidade com role="status" e aria-live.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'dashboard', 'financial', 'occurrences', 'chamados', 'faq', 'documents', 'votacoes', 'transparency'],
      description: 'Variante contextual que define sugestão padrão',
    },
    icon: {
      control: 'text',
      description: 'Emoji ou texto para ícone',
    },
    title: {
      control: 'text',
      description: 'Título principal',
    },
    description: {
      control: 'text',
      description: 'Descrição do estado vazio',
    },
    suggestion: {
      control: 'text',
      description: 'Sugestão adicional (opcional, auto-preenchida por variant)',
    },
  },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    icon: '📝',
    title: 'Nenhum item',
    description: 'Não há itens para exibir no momento.',
  },
}

export const WithSingleAction: Story = {
  args: {
    icon: '🗳️',
    title: 'Nenhuma votação',
    description: 'Não há pautas ativas no momento.',
    variant: 'votacoes',
    action: {
      label: 'Criar pauta',
      onClick: () => alert('Criar pauta clicado'),
    },
  },
}

export const WithMultipleActions: Story = {
  args: {
    icon: '🔍',
    title: 'Nada encontrado',
    description: 'Nenhuma pergunta corresponde ao termo buscado.',
    variant: 'faq',
    actions: [
      {
        label: 'Limpar busca',
        onClick: () => alert('Limpar busca'),
        variant: 'secondary',
      },
      {
        label: 'Perguntar à Norma',
        onClick: () => alert('Abrir chatbot'),
        variant: 'primary',
      },
    ],
  },
}

export const Financial: Story = {
  args: {
    icon: '📊',
    title: 'Nenhum lançamento encontrado',
    description: 'Não há despesas para exibir neste período.',
    variant: 'financial',
    action: {
      label: 'Limpar Filtros',
      onClick: () => alert('Filtros limpos'),
    },
  },
}

export const Occurrences: Story = {
  args: {
    icon: '🎉',
    title: 'Nenhuma ocorrência',
    description: 'Não há registros com este filtro.',
    variant: 'occurrences',
    actions: [
      {
        label: 'Limpar Filtros',
        onClick: () => alert('Filtros limpos'),
        variant: 'secondary',
      },
      {
        label: 'Registrar Ocorrência',
        onClick: () => alert('Nova ocorrência'),
      },
    ],
  },
}

export const Documents: Story = {
  args: {
    icon: '📄',
    title: 'Biblioteca vazia',
    description: 'Nenhum documento foi publicado ainda.',
    variant: 'documents',
  },
}
