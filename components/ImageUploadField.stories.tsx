import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ImageUploadField } from './ImageUploadField';

const meta = {
  title: 'Components/ImageUploadField',
  component: ImageUploadField,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ImageUploadField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('');

    return (
      <div className="max-w-md">
        <ImageUploadField
          label="Campaign Logo"
          value={value}
          onChange={setValue}
          minSize={500}
          aspectRatio="square"
        />
      </div>
    );
  },
};

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = useState('https://images.unsplash.com/photo-1552664730-d307ca884978?w=500');

    return (
      <div className="max-w-md">
        <ImageUploadField
          label="Campaign Logo"
          value={value}
          onChange={setValue}
          minSize={500}
          aspectRatio="square"
        />
      </div>
    );
  },
};

export const RectangleAspect: Story = {
  render: () => {
    const [value, setValue] = useState('');

    return (
      <div className="max-w-md">
        <ImageUploadField
          label="Hero Image"
          value={value}
          onChange={setValue}
          minSize={1000}
          aspectRatio="any"
        />
      </div>
    );
  },
};
