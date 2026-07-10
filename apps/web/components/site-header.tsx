"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "@/lib/auth-client";
import { Avatar } from "@/components/avatar";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "How it Works", href: "/#how-it-works" },
  { label: "Impact Partners", href: "/partner-with-us" },
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
    pathname === "/auth/verify"
  ) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-8xl items-center justify-between gap-4 px-6 py-3 sm:px-10">
        <Link
          href="/"
          className="flex items-center gap-1 text-xl font-bold text-slate-900"
        >
          <span className="text-emerald-600">1</span>
          <span>Rupee</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-emerald-700"
            >
              {link.label}
            </Link>
          ))}
          {session?.user ? (
            <div className="flex items-center gap-3">
              <Avatar name={session.user.name || session.user.email} />
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  router.push("/");
                }}
                className="text-sm font-medium text-slate-600 transition hover:text-emerald-700"
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/auth/sign-in"
                className="text-sm font-medium text-slate-600 transition hover:text-emerald-700"
              >
                Sign in
              </Link>
              <Link
                href="/auth/sign-up"
                className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Register
              </Link>
            </>
          )}
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 transition hover:bg-emerald-50 md:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-emerald-100 bg-white md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-3 sm:px-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
            >
              {link.label}
            </Link>
          ))}
          {session?.user ? (
            <>
              <div className="flex items-center gap-3 rounded-md px-2 py-2">
                <Avatar name={session.user.name || session.user.email} />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{session.user.name || session.user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  router.push("/");
                  setOpen(false);
                }}
                className="rounded-md px-2 py-2 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/sign-in"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
              >
                Sign in
              </Link>
              <Link
                href="/auth/sign-up"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-emerald-600 px-5 py-2 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
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
