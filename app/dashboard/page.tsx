"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import { formatInr } from "@/lib/public";
import {
  dashboardRequest,
  calculateDonationRunway,
  formatRunwayDays,
} from "@/lib/dashboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

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
    <div className="space-y-8 py-8">
      {/* Greeting */}
      <div className="text-center pb-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-black mb-2">
          Hello,{" "}
          <span className="relative inline-block">
            {firstName}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 sm:-bottom-3">
              <Image
                src="/lineunder.svg"
                alt="Decorative line"
                width={111}
                height={10}
                className="h-2 sm:h-3 w-auto"
              />
            </div>
          </span>{" "}
          👋
        </h1>
      </div>

      {/* Currently Supporting Section */}
      {!loading && activePledges.length > 0 && (
        <div className="space-y-6 flex flex-col items-center justify-center w-full mt-6">
          <p
            className="text-sm sm:text-base font-bold text-blue-600"
            style={{ color: "#4077A4" }}
          >
            You're currently supporting:
          </p>
          <div className="space-y-2 sm:space-y-3 w-full">
            {activePledges.slice(0, 3).map((pledge) => (
              <Card
                key={pledge.id}
                className="border border-slate-200 bg-white p-4 sm:p-5 hover:shadow-md transition max-w-md mx-auto"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">
                      {pledge.campaign_title || "Campaign"}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 mb-4">
                      {pledge.tier_title || "Support tier"}
                      {typeof pledge.daily_amount === "number" && (
                        <span className="ml-2 text-slate-700">
                          • {formatInr(pledge.daily_amount)}/day
                        </span>
                      )}
                    </p>
                    <span className="inline-flex items-center rounded-full bg-[hsl(var(--primary))]/10 px-3 py-1 text-xs font-semibold text-[hsl(var(--primary))]">
                      ACTIVE
                    </span>
                  </div>
                  <Link
                    href="/dashboard/pledges"
                    className="shrink-0 text-slate-400 hover:text-blue-600 transition text-xs sm:text-sm font-medium whitespace-nowrap ml-2"
                  >
                    <ChevronRight className="w-6 h-6 " />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
          <div className="pt-1 sm:pt-2">
            {activePledges.length > 3 && (
              <p className="text-xs sm:text-sm mb-2 sm:mb-4">
                <Link
                  href="/dashboard/pledges"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Manage all causes{" "}
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 inline-block ml-1" />
                </Link>
              </p>
            )}
            <p className="text-xs sm:text-sm text-slate-500 text-center mb-8">
              Thank You for your support
            </p>
          </div>
        </div>
      )}

      {/* Generosity Funded For Section */}
      {!loading && activePledges.length > 0 && (
        <div
          className="relative -mx-6 sm:-mx-10 p-6 sm:p-8 pt-8 sm:px-12 "
          style={{
            backgroundImage: "url('/wavebg.svg')",
            backgroundPosition: "center top",
            backgroundRepeat: "repeat-x",
            backgroundSize: "auto 100%",
          }}
        >
          <div className="relative z-10 text-center pt-6">
            <p
              className="text-sm font-bold my-4 sm:mb-6"
              style={{ color: "#4077A4" }}
            >
              Your generosity is funded for:
            </p>
            <div className="flex flex-col items-center">
              <div className="shrink-0 mb-4 sm:mb-6">
                <Image
                  src="/illustrations/1rp-illus-calendar.svg"
                  alt="Calendar illustration"
                  width={150}
                  height={200}
                />
              </div>
              <div>
                <p
                  className="font-kalam text-4xl  font-bold mb-2 leading-tight"
                  style={{ color: "#4077A4" }}
                >
                  {donationRunway.toLocaleString()} more{" "}
                  {donationRunway === 1 ? "day" : "days"}
                </p>
                <div className="flex justify-center mb-4 sm:mb-6">
                  <Image
                    src="/lineunder.svg"
                    alt="Decorative line"
                    width={111}
                    height={10}
                    className="h-2 sm:h-3 w-auto"
                  />
                </div>

                <p
                  className="text-sm mb-8 leading-6"
                  style={{ color: "#4077A4" }}
                >
                  Current Wallet Balance:
                  <span
                    className="font-semibold  text-blue-900 px-1"
                    style={{ color: "#4077A4" }}
                  >
                    {formatInr(wallet?.cached_balance || 0)}
                  </span>
                  <br />
                  Total Daily Commitment :
                  <span
                    className="font-semibold  text-blue-900 px-1"
                    style={{ color: "#4077A4" }}
                  >
                    {formatInr(totalDailyAmount)}
                  </span>
                </p>
                <Link href="/dashboard/wallet/topup" className="inline-block">
                  <Button className="text-sm text-[#6F470D] bg-[#F5D57D] hover:bg-[#f9dc8c] font-semibold px-8 py-6 rounded-full border border-[#6F470D/50] hover:border-[#f9dc8c] transition">
                    Extend My Impact →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Your Impact Section */}
      <div className="p-8 text-center mt-8">
        <h2
          className=" font-kalam text-4xl font-bold mb-2 sm:mb-6"
          style={{ color: "#4077A4" }}
        >
          Your Impact
        </h2>
        <p className="text-xs sm:text-base text-slate-500 mb-6 sm:mb-8">
          Your one small daily action helps fuels life-changing causes across
          India
        </p>
        <div
          className="text-4xl sm:text-6xl font-bold text-blue-900 mb-4"
          style={{ color: "#4077A4" }}
        >
          {loading ? "…" : formatInr(totalRaised)}
        </div>
        {donations.length > 0 && (
          <p className="text-sm text-slate-600">
            Raised so far, towards
            <span
              className="font-semibold text-lg text-blue-900 px-1"
              style={{ color: "#4077A4" }}
            >
              {activePledges.length}
            </span>
            {activePledges.length === 1 ? "campaign" : "campaigns"}, over
            <span
              className="font-semibold text-lg text-blue-900 px-1"
              style={{ color: "#4077A4" }}
            >
              {Math.ceil(donations.length / Math.max(activePledges.length, 1))}
            </span>
            day{donations.length > 1 ? "s" : ""}.
          </p>
        )}
      </div>
    </div>
  );
}
