import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Dialog } from '../dialog';
import { Button } from '../button';

const meta = {
  title: 'UI/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  args: {
    open: false,
    title: 'Confirm Action',
    description: 'Are you sure you want to proceed?',
    onOpenChange: () => {},
  },
};

export const OpenBasic: Story = {
  args: {
    open: true,
    title: 'Confirm Action',
    description: 'Are you sure you want to proceed?',
    onOpenChange: () => {},
    confirmText: 'Yes, continue',
    cancelText: 'Cancel',
  },
};

export const OpenDangerous: Story = {
  args: {
    open: true,
    title: 'Delete Campaign',
    description: 'This action cannot be undone. Are you sure?',
    onOpenChange: () => {},
    confirmText: 'Delete',
    cancelText: 'Cancel',
    isDangerous: true,
  },
};

export const WithChildren: Story = {
  args: {
    open: true,
    title: 'Enter Details',
    children: (
      <div className="space-y-4">
        <p>Please provide additional information:</p>
        <input
          type="text"
          placeholder="Enter your name"
          className="w-full border rounded px-3 py-2"
        />
      </div>
    ),
    onOpenChange: () => {},
    confirmText: 'Submit',
    cancelText: 'Cancel',
  },
};

export const Interactive: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className="space-y-4">
        <Button onClick={() => setOpen(true)}>Open Dialog</Button>
        <Dialog
          open={open}
          onOpenChange={setOpen}
          title="Confirm Action"
          description="Are you sure you want to proceed?"
          confirmText="Yes"
          cancelText="No"
          onConfirm={() => {
            setOpen(false);
            alert('Confirmed!');
          }}
        />
      </div>
    );
  },
};
