"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession, signIn, signOut } from "@/lib/auth-client";

const DEFAULT_ADMIN_EMAIL = "ayushsaran@gmail.com";

// Gates the entire /admin area: requires an authenticated ADMIN session,
// otherwise shows a passwordless (magic-link) admin login screen.
export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const { data, isPending } = useSession();

  if (isPending) {
    return (
      <div className="grid min-h-screen place-items-center text-slate-500">
        Loading…
      </div>
    );
  }

  const role = (data?.user as { role?: string } | undefined)?.role;

  if (data && role === "ADMIN") {
    return <>{children}</>;
  }

  // Signed in but not an admin.
  if (data && role !== "ADMIN") {
    return (
      <div className="grid min-h-screen place-items-center px-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-semibold text-slate-900">
            Not authorized
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {data.user?.email} isn&apos;t an admin account.
          </p>
          <Button
            variant="outline"
            onClick={() => signOut()}
            className="mt-6"
          >
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  return <AdminLogin />;
}

function AdminLogin() {
  const [email, setEmail] = useState(DEFAULT_ADMIN_EMAIL);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: sendError } = await signIn.magicLink({ email });
    setLoading(false);
    if (sendError) {
      setError(sendError.message || "Could not send the sign-in link.");
      return;
    }
    setSent(true);
  }

  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[hsl(var(--primary))]">
          1Rupee
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          Admin sign in
        </h1>
        <p className="mb-6 mt-1 text-sm text-slate-600">
          We&apos;ll email you a secure sign-in link (printed to the API console
          in dev).
        </p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {sent ? (
          <div className="rounded-xl bg-[hsl(var(--primary))]/10 p-4 text-sm text-[hsl(var(--primary))]">
            <p className="font-semibold">Check your email</p>
            <p className="mt-1">
              A sign-in link was sent to <strong>{email}</strong>. In local dev
              the link is printed in the API server console.
            </p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={submit}>
            <label className="block text-sm font-medium text-slate-700">
              Admin email
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending…" : "Send sign-in link"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
