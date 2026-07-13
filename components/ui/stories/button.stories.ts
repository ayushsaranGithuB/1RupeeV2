import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '../button';

const meta = {
    title: 'UI/Button',
    component: Button,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        children: 'Click me',
    },
};

export const Destructive: Story = {
    args: {
        variant: 'destructive',
        children: 'Delete',
    },
};

export const Outline: Story = {
    args: {
        variant: 'outline',
        children: 'Outlined',
    },
};

export const Secondary: Story = {
    args: {
        variant: 'secondary',
        children: 'Secondary',
    },
};

export const Hero: Story = {
    args: {
        variant: 'hero',
        children: 'Hero',
    },
};

export const Ghost: Story = {
    args: {
        variant: 'ghost',
        children: 'Ghost',
    },
};

export const Link: Story = {
    args: {
        variant: 'link',
        children: 'Link button',
    },
};

export const Small: Story = {
    args: {
        size: 'sm',
        children: 'Small button',
    },
};

export const Large: Story = {
    args: {
        size: 'lg',
        children: 'Large button',
    },
};

export const Icon: Story = {
    args: {
        size: 'icon',
        children: '🎉',
    },
};

export const Disabled: Story = {
    args: {
        disabled: true,
        children: 'Disabled',
    },
};
