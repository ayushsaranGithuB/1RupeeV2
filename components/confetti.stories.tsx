import type { Meta, StoryObj } from '@storybook/react';
import { Confetti } from './confetti';

const meta = {
  title: 'Components/Confetti',
  component: Confetti,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Confetti>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-full h-96 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center relative">
      <Confetti />
      <div className="text-center z-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">🎉 Celebration!</h2>
        <p className="text-slate-600">Watch the confetti animation above</p>
      </div>
    </div>
  ),
};

export const FullScreen: Story = {
  render: () => (
    <div className="w-full min-h-screen bg-white flex items-center justify-center">
      <Confetti />
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Achievement Unlocked! ✨</h1>
        <p className="text-lg text-slate-600">You just made an impact!</p>
      </div>
    </div>
  ),
};
