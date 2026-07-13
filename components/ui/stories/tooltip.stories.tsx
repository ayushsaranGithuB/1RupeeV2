import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from '../tooltip';

const meta = {
  title: 'UI/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: 'Helpful tooltip text',
    children: <button className="px-4 py-2 bg-blue-600 text-white rounded">Hover me</button>,
  },
};

export const LongContent: Story = {
  args: {
    content: 'This is a longer tooltip with more information to display on hover',
    children: <button className="px-4 py-2 bg-blue-600 text-white rounded">Info</button>,
  },
};

export const MultipleTooltips: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip content="Save your work">
        <button className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
      </Tooltip>
      <Tooltip content="Delete this item">
        <button className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
      </Tooltip>
      <Tooltip content="Edit the content">
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Edit</button>
      </Tooltip>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Tooltip content="Click for more information">
      <span className="inline-flex items-center justify-center w-6 h-6 text-white bg-blue-600 rounded-full cursor-help">
        ?
      </span>
    </Tooltip>
  ),
};
