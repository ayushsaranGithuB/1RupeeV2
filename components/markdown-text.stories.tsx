import type { Meta, StoryObj } from '@storybook/react';
import { MarkdownText } from './markdown-text';

const meta = {
  title: 'Components/MarkdownText',
  component: MarkdownText,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
    },
  },
} satisfies Meta<typeof MarkdownText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {
    children: 'This is a simple markdown text with **bold** and *italic* formatting.',
  },
};

export const WithHeadings: Story = {
  args: {
    children: `# Main Heading
## Subheading
This is a paragraph with some text.`,
  },
};

export const WithList: Story = {
  args: {
    children: `## Features
- Feature one with some description
- Feature two with details
- Feature three

1. First item
2. Second item
3. Third item`,
  },
};

export const WithLink: Story = {
  args: {
    children: `This text includes [a link to our website](https://1rupee.app) that opens in a new tab.
You can also have **bold text** and *italic text* mixed in.`,
  },
};

export const Complex: Story = {
  args: {
    children: `# Campaign Description

## What We Do
We provide **essential services** to underserved communities.

### Our Mission
- Help those in need
- Create sustainable solutions
- Build stronger communities

Learn more at [our website](https://example.com) for details about our work.

## Support Levels
1. Basic supporter
2. Monthly contributor
3. Annual partner`,
  },
};
