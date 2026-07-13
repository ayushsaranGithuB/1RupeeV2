import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { mocked } from "storybook/test";

import Page, { type Wallet, type Pledge, type Donation } from "./page";
import * as authClientModule from "@/lib/auth-client";
import * as dashboardModule from "@/lib/dashboard";

function mockDashboardData({
  user = { name: "Asha Rao", email: "asha@example.com" },
  wallet = null,
  pledges = [],
  donations = [],
}: {
  user?: { name?: string; email?: string } | null;
  wallet?: Wallet;
  pledges?: Pledge[];
  donations?: Donation[];
} = {}) {
  mocked(authClientModule.useSession).mockReturnValue({
    data: user ? { user } : null,
    isPending: false,
    isRefetching: false,
    error: null,
    refetch: async () => {},
  } as ReturnType<typeof authClientModule.useSession>);

  mocked(dashboardModule.dashboardRequest).mockImplementation(
    async (path: string) => {
      if (path === "/wallets") return wallet as never;
      if (path === "/pledges") return pledges as never;
      if (path === "/donations") return donations as never;
      throw new Error(`Unhandled dashboardRequest path in story mock: ${path}`);
    },
  );
}

const meta = {
  component: Page,
} satisfies Meta<typeof Page>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  beforeEach: () => {
    mockDashboardData({
      wallet: { cached_balance: 450 },
      pledges: [
        {
          id: "pledge_1",
          status: "ACTIVE",
          campaign_title: "Clean Water for Rural Schools",
          tier_title: "Daily Supporter",
          daily_amount: 5,
        },
        {
          id: "pledge_2",
          status: "ACTIVE",
          campaign_title: "Children's Education Fund",
          tier_title: "Champion",
          daily_amount: 10,
        },
      ],
      donations: Array.from({ length: 12 }, (_, i) => ({
        amount: 5 + i,
      })),
    });
  },
};

export const NoActivePledges: Story = {
  beforeEach: () => {
    mockDashboardData({ wallet: { cached_balance: 0 } });
  },
};

export const SignedOut: Story = {
  beforeEach: () => {
    mockDashboardData({ user: null });
  },
};

export const Loading: Story = {
  beforeEach: () => {
    mocked(authClientModule.useSession).mockReturnValue({
      data: null,
      isPending: true,
      isRefetching: false,
      error: null,
      refetch: async () => {},
    } as ReturnType<typeof authClientModule.useSession>);
    mocked(dashboardModule.dashboardRequest).mockImplementation(
      () => new Promise(() => {}),
    );
  },
};
