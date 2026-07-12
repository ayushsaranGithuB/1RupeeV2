"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Runway", href: "/dashboard/wallet" },
  { label: "Causes", href: "/dashboard/pledges" },
  { label: "Impact", href: "/dashboard/donations" },
  { label: "Profile", href: "/dashboard/profile" },
];

function NavLink({
  href,
  label,
  active,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "block rounded-lg px-4 py-2 text-sm font-medium transition md:rounded-full md:px-3 md:py-1",
        active
          ? "bg-emerald-600 text-white"
          : "text-slate-700 hover:bg-slate-100 md:text-slate-600",
      )}
    >
      {label}
    </Link>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex-shrink-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
              1Rupee
            </p>
            <p className="text-xs text-slate-500">{session.user.email}</p>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden flex-1 gap-1 md:flex">
            {navItems.map((item) => {
              const active =
                item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  active={active}
                />
              );
            })}
          </nav>

          {/* Desktop Sign Out Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await signOut();
              router.push("/sign-in");
            }}
            className="hidden md:inline-flex"
          >
            Sign out
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <nav className="border-t border-slate-200 bg-white px-6 py-3 md:hidden">
            <div className="space-y-2">
              {navItems.map((item) => {
                const active =
                  item.href === "/dashboard"
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    active={active}
                    onClick={closeMenu}
                  />
                );
              })}
              <button
                onClick={async () => {
                  await signOut();
                  router.push("/sign-in");
                }}
                className="block w-full rounded-lg px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Sign out
              </button>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1 mx-auto max-w-3xl w-full px-6 py-8">{children}</main>
    </div>
  );
}
