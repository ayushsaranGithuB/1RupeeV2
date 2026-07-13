import type { Meta, StoryObj } from '@storybook/react';
import { SignUpForm } from './auth-form';

const meta = {
  title: 'Components/AuthForm',
  component: SignUpForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SignUpForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <SignUpForm />,
};
