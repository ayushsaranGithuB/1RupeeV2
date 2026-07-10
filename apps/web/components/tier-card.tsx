"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { MarkdownText } from "@/components/markdown-text";
import { Check, Droplets } from "lucide-react";

type TierCardProps = {
  id: string;
  title: string;
  daily_amount: number;
  description?: string | null;
  features?: string[] | null;
  featured?: boolean;
  campaign_id: string;
  campaign_slug?: string;
};

export function TierCard({
  id,
  title,
  daily_amount,
  description,
  features,
  featured,
  campaign_id,
  campaign_slug,
}: TierCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const dailyRupees = Math.round(daily_amount / 100);

  function handlePledgeClick() {
    if (!session?.user) {
      router.push("/auth/sign-in");
      return;
    }
    router.push(`/checkout/tier-select?tier_id=${id}&campaign_id=${campaign_id}${campaign_slug ? `&campaign_slug=${campaign_slug}` : ''}`);
  }

  return (
    <div
      className={`
        relative rounded-3xl border transition-all duration-300

        ${
          featured
            ? "bg-emerald-800 text-white border-emerald-900 shadow-2xl lg:scale-105 py-10"
            : "bg-white border-neutral-200 py-8"
        }

        px-8
      `}
    >
      {/* Icon */}
      <div
        className={`
          mb-6 flex h-16 w-16 items-center justify-center rounded-full

          ${
            featured
              ? "bg-white text-neutral-950"
              : "bg-neutral-100 text-neutral-800"
          }
        `}
      >
        <Droplets size={28} />
      </div>

      {/* Badge */}
      <span
        className={`
          inline-block rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide

          ${
            featured
              ? "bg-white text-neutral-900"
              : "bg-neutral-900 text-white"
          }
        `}
      >
        {title}
      </span>

      {/* Price */}
      <div className="mt-6 flex items-start">
        <span className="mr-1 mt-2 text-xl">₹</span>
        <span className="text-6xl font-bold leading-none">
          {dailyRupees.toLocaleString()}
        </span>
        <span className="ml-1 mt-6 text-sm text-neutral-400 tracking-wide">
          /day
        </span>
      </div>

      {/* Description */}
      <MarkdownText
        className={`mt-6 text-base leading-6 ${
          featured ? "text-neutral-300" : "text-neutral-600"
        }`}
      >
        {description || ""}
      </MarkdownText>

      {/* Features */}
      <ul className="mt-8 space-y-5">
        {(features ?? []).map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <div
              className={`
                mt-0.5 flex h-5 w-5 items-center justify-center rounded-full

                ${
                  featured
                    ? "bg-white text-neutral-900"
                    : "bg-neutral-900 text-white"
                }
              `}
            >
              <Check size={12} strokeWidth={3} />
            </div>

            <span
              className={
                featured ? "text-neutral-100" : "text-neutral-700"
              }
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        onClick={handlePledgeClick}
        className={`
          mt-10 w-full rounded-full py-3 font-medium transition cursor-pointer

          ${
            featured
              ? "bg-white text-neutral-950 hover:bg-neutral-200"
              : "border border-neutral-300 hover:bg-neutral-100"
          }
        `}
      >
        Start with ₹{dailyRupees.toLocaleString()} a day
      </Button>
    </div>
  );
}
