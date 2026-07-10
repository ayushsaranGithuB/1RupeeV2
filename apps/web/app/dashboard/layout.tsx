"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Wallet", href: "/dashboard/wallet" },
  { label: "Pledges", href: "/dashboard/pledges" },
  { label: "Donations", href: "/dashboard/donations" },
  { label: "Profile", href: "/dashboard/profile" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/sign-in");
    }
  }, [isPending, session, router]);

  if (isPending || !session) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 text-slate-600">
        Loading your dashboard…
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex-shrink-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
              1Rupee
            </p>
            <p className="text-xs text-slate-500">{session.user.email}</p>
          </div>

          <nav className="flex flex-1 gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const active =
                item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium transition",
                    active
                      ? "bg-emerald-600 text-white"
                      : "text-slate-600 hover:bg-slate-100",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={async () => {
              await signOut();
              router.push("/sign-in");
            }}
            className="flex-shrink-0 rounded-full border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
    </div>
  );
}
