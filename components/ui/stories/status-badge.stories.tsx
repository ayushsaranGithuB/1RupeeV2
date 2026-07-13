import type { Meta, StoryObj } from "@storybook/react";
import { StatusBadge } from "../status-badge";

const meta = {
  title: "UI/StatusBadge",
  component: StatusBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["active", "paused", "cancelled"],
    },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {
    variant: "active",
    children: "ACTIVE",
  },
};

export const Paused: Story = {
  args: {
    variant: "paused",
    children: "PAUSED",
  },
};

export const Cancelled: Story = {
  args: {
    variant: "cancelled",
    children: "CANCELLED",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap items-center justify-center">
      <StatusBadge variant="active">ACTIVE</StatusBadge>
      <StatusBadge variant="paused">PAUSED</StatusBadge>
      <StatusBadge variant="cancelled">CANCELLED</StatusBadge>
    </div>
  ),
};
