import type { Meta, StoryObj } from '@storybook/react'
import LoadingSpinner from './LoadingSpinner'

const meta = {
  title: 'Components/LoadingSpinner',
  component: LoadingSpinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Spinner de carregamento com mensagem opcional e tema Versix.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: 'text',
      description: 'Mensagem opcional exibida abaixo do spinner',
    },
  },
} satisfies Meta<typeof LoadingSpinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const WithMessage: Story = {
  args: {
    message: 'Carregando dados...',
  },
}

export const LoadingDespesas: Story = {
  args: {
    message: 'Carregando balancete...',
  },
}

export const LoadingDocuments: Story = {
  args: {
    message: 'Buscando documentos...',
  },
}
