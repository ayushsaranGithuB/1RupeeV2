import type { Meta, StoryObj } from '@storybook/react';
import { Select } from '../select';

const meta = {
  title: 'UI/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Select className="w-64">
      <option value="">Select an option</option>
      <option value="option1">Option 1</option>
      <option value="option2">Option 2</option>
      <option value="option3">Option 3</option>
    </Select>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <Select className="w-64">
      <option value="">Select a fruit</option>
      <optgroup label="Fruits">
        <option value="apple">Apple</option>
        <option value="banana">Banana</option>
        <option value="orange">Orange</option>
      </optgroup>
      <optgroup label="Vegetables">
        <option value="carrot">Carrot</option>
        <option value="lettuce">Lettuce</option>
      </optgroup>
    </Select>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select className="w-64" disabled>
      <option value="">Select an option</option>
      <option value="option1">Option 1</option>
      <option value="option2">Option 2</option>
    </Select>
  ),
};

export const WithDefaultValue: Story = {
  render: () => (
    <Select className="w-64" defaultValue="option2">
      <option value="">Select an option</option>
      <option value="option1">Option 1</option>
      <option value="option2">Option 2 (Default)</option>
      <option value="option3">Option 3</option>
    </Select>
  ),
};
