import type { Meta, StoryObj } from '@storybook/react'
import { CardSkeleton, TableSkeleton, FormSkeleton, ListSkeleton, StatCardSkeleton, DashboardSkeleton, PageSkeleton } from './Skeleton'

const meta = {
  title: 'Components/Skeleton',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Skeleton loaders contextuais para feedback visual de carregamento. Reduz percepção de tempo de espera.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta

export default meta

export const Card: StoryObj = {
  render: () => <CardSkeleton />,
}

export const Table: StoryObj = {
  render: () => <TableSkeleton rows={5} />,
}

export const Form: StoryObj = {
  render: () => <FormSkeleton />,
}

export const List: StoryObj = {
  render: () => <ListSkeleton count={4} />,
}

export const StatCard: StoryObj = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
  ),
}

export const Dashboard: StoryObj = {
  render: () => <DashboardSkeleton />,
}

export const Page: StoryObj = {
  render: () => <PageSkeleton />,
}

export const MultipleCards: StoryObj = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  ),
}

export const LongList: StoryObj = {
  render: () => <ListSkeleton count={8} />,
}
