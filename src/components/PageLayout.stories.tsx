import type { Meta, StoryObj } from '@storybook/react'
import PageLayout from './PageLayout'

const meta = {
  title: 'Components/PageLayout',
  component: PageLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Layout de página com header gradiente, título, subtítulo, ícone e ação opcional.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PageLayout>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Prestação de Contas',
    subtitle: 'Transparência financeira do condomínio',
    icon: '⚖️',
    children: (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">Conteúdo da página aqui...</p>
      </div>
    ),
  },
}

export const WithAction: Story = {
  args: {
    title: 'Prestação de Contas',
    subtitle: 'Transparência financeira do condomínio',
    icon: '⚖️',
    headerAction: (
      <button className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-bold hover:bg-white/30 transition text-sm flex items-center gap-2 border border-white/30">
        <span>📥</span> Exportar CSV
      </button>
    ),
    children: (
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-2">Seção 1</h3>
          <p className="text-gray-600">Conteúdo...</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-2">Seção 2</h3>
          <p className="text-gray-600">Conteúdo...</p>
        </div>
      </div>
    ),
  },
}

export const Dashboard: Story = {
  args: {
    title: 'Dashboard',
    subtitle: 'Visão geral do condomínio',
    icon: '📊',
    children: (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📈</span>
              <span className="text-sm text-gray-500">Métrica {i}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{i * 10}</p>
          </div>
        ))}
      </div>
    ),
  },
}

export const Ocorrencias: Story = {
  args: {
    title: 'Ocorrências',
    subtitle: 'Gestão de registros e acompanhamento',
    icon: '📋',
    headerAction: (
      <button className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-bold hover:bg-white/30 transition text-sm">
        + Nova Ocorrência
      </button>
    ),
    children: (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">Lista de ocorrências...</p>
      </div>
    ),
  },
}
