"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "@/lib/auth-client";
import { Avatar } from "@/components/avatar";
import Image from "next/image";

const navLinks = [
  { label: "How it Works", href: "/#how-it-works" },
  { label: "Campaigns", href: "/campaigns" },
  { label: "FAQ", href: "/faq" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  // Admin and dashboard have their own chrome; keep the public nav off those
  // routes. The magic-link verify page is a transient full-screen confirmation —
  // nav links there just distract from (or short-circuit) the auto-redirect.
  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/dashboard") ||
    pathname === "/verify"
  ) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50  bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-8xl items-center justify-between gap-4 px-6 py-3 sm:px-10">
        <Link
          href="/"
          className="flex items-center gap-1 text-xl font-bold text-slate-900"
        >
          <Image src="/logo.png" alt="1Rupee Logo" width={128} height={57} />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "font-kalam",
                "text-lg font-medium text-[hsl(var(--primary))] transition hover:text-[hsl(var(--primary))]/80",
              )}
            >
              {link.label}
            </Link>
          ))}
          {session?.user ? (
            <div className="flex items-center  rounded-xl border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-900">
              <Avatar
                name={session.user.name || session.user.email}
                size="sm"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await signOut();
                  router.push("/");
                }}
              >
                Sign out
              </Button>
            </div>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm font-medium text-slate-600 transition hover:text-[hsl(var(--primary))]"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-[hsl(var(--primary-button))] px-5 py-2 text-sm font-semibold text-[hsl(var(--primary-button-foreground))] transition hover:bg-[hsl(var(--primary-button-hover))]"
              >
                Register
              </Link>
            </>
          )}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="md:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </Button>
      </div>

      <div
        className={cn(
          "border-t border-[hsl(var(--primary))]/20 bg-white md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-3 sm:px-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "font-kalam",
                "rounded-md px-2 py-2 text-sm font-medium text-slate-700 transition hover:bg-[hsl(var(--primary))]/5 hover:text-[hsl(var(--primary))]",
              )}
            >
              {link.label}
            </Link>
          ))}
          {session?.user ? (
            <>
              <div className="flex items-center gap-3 rounded-md px-2 py-2">
                <Avatar name={session.user.name || session.user.email} />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {session.user.name || session.user.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={async () => {
                  await signOut();
                  router.push("/");
                  setOpen(false);
                }}
                className="justify-start"
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm font-medium text-slate-700 transition hover:bg-[hsl(var(--primary))]/5 hover:text-[hsl(var(--primary))]"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-[hsl(var(--primary-button))] px-5 py-2 text-center text-sm font-semibold text-[hsl(var(--primary-button-foreground))] transition hover:bg-[hsl(var(--primary-button-hover))]"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
