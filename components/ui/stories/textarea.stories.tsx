import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '../textarea';

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter your message here...',
  },
};

export const WithRows: Story = {
  args: {
    placeholder: 'Enter your message here...',
    rows: 6,
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled textarea',
    disabled: true,
    rows: 4,
  },
};

export const WithDefaultValue: Story = {
  args: {
    defaultValue: 'This is a textarea with some default content.',
    rows: 4,
  },
};

export const WithMaxLength: Story = {
  args: {
    placeholder: 'Maximum 100 characters',
    maxLength: 100,
    rows: 3,
  },
};
