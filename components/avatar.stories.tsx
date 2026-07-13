import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './avatar';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'text',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'John Doe',
  },
};

export const Small: Story = {
  args: {
    name: 'Jane Smith',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    name: 'Raj Kumar',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    name: 'Priya Sharma',
    size: 'lg',
  },
};

export const SingleName: Story = {
  args: {
    name: 'Madonna',
    size: 'md',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <Avatar name="John Doe" size="sm" />
        <span className="text-xs text-slate-600">Small</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar name="Jane Smith" size="md" />
        <span className="text-xs text-slate-600">Medium</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar name="Raj Kumar" size="lg" />
        <span className="text-xs text-slate-600">Large</span>
      </div>
    </div>
  ),
};

export const MultipleAvatars: Story = {
  render: () => (
    <div className="flex gap-4">
      <Avatar name="Alice Johnson" size="md" />
      <Avatar name="Bob Wilson" size="md" />
      <Avatar name="Carol Brown" size="md" />
      <Avatar name="David Lee" size="md" />
    </div>
  ),
};
