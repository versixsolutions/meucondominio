import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Design System/Typography',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Hierarquia tipográfica do sistema de design Versix Norma.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta

export default meta

export const Headings: StoryObj = {
  render: () => (
    <div className="space-y-6">
      <div>
        <span className="text-xs text-gray-500 font-mono">text-4xl (36px) - font-bold</span>
        <h1 className="text-4xl font-bold text-gray-900">Heading 1 - Portal do Morador</h1>
      </div>
      <div>
        <span className="text-xs text-gray-500 font-mono">text-3xl (30px) - font-bold</span>
        <h2 className="text-3xl font-bold text-gray-900">Heading 2 - Seção Principal</h2>
      </div>
      <div>
        <span className="text-xs text-gray-500 font-mono">text-2xl (24px) - font-bold</span>
        <h3 className="text-2xl font-bold text-gray-900">Heading 3 - Subseção</h3>
      </div>
      <div>
        <span className="text-xs text-gray-500 font-mono">text-xl (20px) - font-bold</span>
        <h4 className="text-xl font-bold text-gray-900">Heading 4 - Título de Card</h4>
      </div>
      <div>
        <span className="text-xs text-gray-500 font-mono">text-lg (18px) - font-semibold</span>
        <h5 className="text-lg font-semibold text-gray-900">Heading 5 - Subtítulo</h5>
      </div>
      <div>
        <span className="text-xs text-gray-500 font-mono">text-base (16px) - font-semibold</span>
        <h6 className="text-base font-semibold text-gray-900">Heading 6 - Label Destaque</h6>
      </div>
    </div>
  ),
}

export const Body: StoryObj = {
  render: () => (
    <div className="space-y-6">
      <div>
        <span className="text-xs text-gray-500 font-mono">text-base (16px)</span>
        <p className="text-base text-gray-900">
          Body Large - Este é um parágrafo de texto padrão usado na maioria dos conteúdos. Possui boa legibilidade e é adequado para blocos longos de texto.
        </p>
      </div>
      <div>
        <span className="text-xs text-gray-500 font-mono">text-sm (14px)</span>
        <p className="text-sm text-gray-600">
          Body - Texto secundário usado em descrições, legendas e conteúdos complementares. Mantém boa legibilidade em tamanhos menores.
        </p>
      </div>
      <div>
        <span className="text-xs text-gray-500 font-mono">text-xs (12px)</span>
        <p className="text-xs text-gray-500">
          Caption - Texto pequeno para metadados, timestamps e informações auxiliares. Use com moderação para não comprometer acessibilidade.
        </p>
      </div>
    </div>
  ),
}

export const Weights: StoryObj = {
  render: () => (
    <div className="space-y-4">
      <div>
        <span className="text-xs text-gray-500 font-mono">font-normal (400)</span>
        <p className="font-normal text-gray-900">The quick brown fox jumps over the lazy dog</p>
      </div>
      <div>
        <span className="text-xs text-gray-500 font-mono">font-medium (500)</span>
        <p className="font-medium text-gray-900">The quick brown fox jumps over the lazy dog</p>
      </div>
      <div>
        <span className="text-xs text-gray-500 font-mono">font-semibold (600)</span>
        <p className="font-semibold text-gray-900">The quick brown fox jumps over the lazy dog</p>
      </div>
      <div>
        <span className="text-xs text-gray-500 font-mono">font-bold (700)</span>
        <p className="font-bold text-gray-900">The quick brown fox jumps over the lazy dog</p>
      </div>
    </div>
  ),
}

export const Examples: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Card com Hierarquia</h3>
        <p className="text-sm text-gray-500 mb-4">Subtítulo em texto menor</p>
        <p className="text-base text-gray-700 mb-4">
          Este é um exemplo de conteúdo de card com hierarquia tipográfica bem definida. O título se destaca, seguido pelo subtítulo e corpo de texto.
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Atualizado há 2 horas</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Prestação de Contas</h2>
        <p className="text-lg opacity-90">Transparência financeira do condomínio</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900">R$ 45.280,00</span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            +12%
          </span>
        </div>
        <p className="text-sm text-gray-500">Total Pago</p>
      </div>
    </div>
  ),
}
