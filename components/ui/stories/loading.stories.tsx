import type { Meta, StoryObj } from '@storybook/react';
import LoadingCoin from '../loading';

const meta = {
  title: 'UI/Loading',
  component: LoadingCoin,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LoadingCoin>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <LoadingCoin />,
};

export const OnColoredBackground: Story = {
  render: () => (
    <div className="w-80 h-80 bg-blue-50 flex items-center justify-center rounded-lg">
      <LoadingCoin />
    </div>
  ),
};
