"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import {
  dashboardRequest,
  calculateDonationRunway,
} from "@/lib/dashboard";
import { Dashboard } from "@/components/dashboard";

type Wallet = { cached_balance: number } | null;

type Pledge = {
  id: string;
  status: string;
  campaign_title?: string;
  tier_title?: string;
  daily_amount?: number;
};

type Donation = {
  amount: number;
  created_at?: string;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [wallet, setWallet] = useState<Wallet>(null);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "1Rupee - Dashboard";
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const [w, p, d] = await Promise.all([
        dashboardRequest<Wallet>("/wallets").catch(() => null),
        dashboardRequest<Pledge[]>("/pledges").catch(() => []),
        dashboardRequest<Donation[]>("/donations").catch(() => []),
      ]);
      if (!active) return;
      setWallet(w ?? null);
      setPledges(Array.isArray(p) ? p : []);
      setDonations(Array.isArray(d) ? d : []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const activePledges = pledges.filter((p) => p.status === "ACTIVE");
  const totalDailyAmount = activePledges.reduce(
    (sum, p) => sum + (p.daily_amount || 0),
    0,
  );
  const donationRunway = calculateDonationRunway(
    wallet?.cached_balance || 0,
    totalDailyAmount,
  );
  const totalRaised = donations.reduce((sum, d) => sum + d.amount, 0);
  const user = session?.user;
  const firstName =
    user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "Friend";

  return (
    <Dashboard
      firstName={firstName}
      activePledges={activePledges}
      totalDailyAmount={totalDailyAmount}
      wallet={wallet}
      donationRunway={donationRunway}
      donations={donations}
      totalRaised={totalRaised}
      loading={loading}
    />
  );
}
