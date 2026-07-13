import type { Meta, StoryObj } from "@storybook/react";
import { Dashboard } from "./dashboard";

const meta = {
  title: "Components/Dashboard",
  component: Dashboard,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    firstName: {
      control: "text",
      description: "User's first name",
    },
    activePledges: {
      control: "object",
      description: "Array of active pledges",
    },
    totalDailyAmount: {
      control: "number",
      description: "Total daily commitment in rupees",
    },
    wallet: {
      control: "object",
      description: "Wallet object with cached_balance",
    },
    donationRunway: {
      control: "number",
      description: "Number of days funding will last",
    },
    donations: {
      control: "object",
      description: "Array of donations",
    },
    totalRaised: {
      control: "number",
      description: "Total amount raised in rupees",
    },
    loading: {
      control: "boolean",
      description: "Loading state",
    },
  },
} satisfies Meta<typeof Dashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

const samplePledges = [
  {
    id: "1",
    status: "ACTIVE",
    campaign_title: "Clean Water Initiative",
    tier_title: "Daily Supporter",
    daily_amount: 5,
  },
  {
    id: "2",
    status: "ACTIVE",
    campaign_title: "Education for All",
    tier_title: "Monthly Contributor",
    daily_amount: 10,
  },
  {
    id: "3",
    status: "ACTIVE",
    campaign_title: "Healthcare Access",
    tier_title: "Weekly Backer",
    daily_amount: 3,
  },
];

const sampleDonations = [
  { amount: 100, created_at: "2024-01-15" },
  { amount: 250, created_at: "2024-01-16" },
  { amount: 150, created_at: "2024-01-17" },
  { amount: 300, created_at: "2024-01-18" },
];

export const WithActivePledges: Story = {
  args: {
    firstName: "Ayush",
    activePledges: samplePledges,
    totalDailyAmount: 18,
    wallet: { cached_balance: 5000 },
    donationRunway: 277,
    donations: sampleDonations,
    totalRaised: 800,
    loading: false,
  },
};

export const NoPledges: Story = {
  args: {
    firstName: "Sarah",
    activePledges: [],
    totalDailyAmount: 0,
    wallet: { cached_balance: 0 },
    donationRunway: 0,
    donations: [],
    totalRaised: 0,
    loading: false,
  },
};

export const SinglePledge: Story = {
  args: {
    firstName: "Raj",
    activePledges: [samplePledges[0]],
    totalDailyAmount: 5,
    wallet: { cached_balance: 2500 },
    donationRunway: 500,
    donations: [sampleDonations[0]],
    totalRaised: 100,
    loading: false,
  },
};

export const LargeDailyCommitment: Story = {
  args: {
    firstName: "Priya",
    activePledges: samplePledges,
    totalDailyAmount: 100,
    wallet: { cached_balance: 10000 },
    donationRunway: 100,
    donations: sampleDonations,
    totalRaised: 2500,
    loading: false,
  },
};

export const LoadingState: Story = {
  args: {
    firstName: "User",
    activePledges: [],
    totalDailyAmount: 0,
    wallet: null,
    donationRunway: 0,
    donations: [],
    totalRaised: 0,
    loading: true,
  },
};

export const ManyPledges: Story = {
  args: {
    firstName: "Generous",
    activePledges: [
      ...samplePledges,
      {
        id: "4",
        status: "ACTIVE",
        campaign_title: "Mental Health Support",
        tier_title: "Guardian",
        daily_amount: 7,
      },
      {
        id: "5",
        status: "ACTIVE",
        campaign_title: "Disaster Relief",
        tier_title: "Hero",
        daily_amount: 15,
      },
    ],
    totalDailyAmount: 40,
    wallet: { cached_balance: 8000 },
    donationRunway: 200,
    donations: [...sampleDonations, ...sampleDonations],
    totalRaised: 1600,
    loading: false,
  },
};
