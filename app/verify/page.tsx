"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type Status = "verifying" | "success" | "error";

// Landing page for the magic-link email. Completes verification via the auth
// client (JSON response through the proxy, so the session cookie is set on this
// origin), shows a confirmation, then auto-continues to the right destination.
export default function VerifyPage() {
  const [status, setStatus] = useState<Status>("verifying");
  const [error, setError] = useState<string | null>(null);
  const [destination, setDestination] = useState("/dashboard");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setStatus("error");
      setError("This sign-in link is missing its token.");
      return;
    }

    (async () => {
      const { error: verifyError } = await authClient.magicLink.verify({
        query: { token },
      });
      if (verifyError) {
        setStatus("error");
        setError(verifyError.message || "This link is invalid or has expired.");
        return;
      }
      const { data } = await authClient.getSession();
      const role = (data?.user as { role?: string } | undefined)?.role;
      setDestination(role === "ADMIN" ? "/admin" : "/dashboard");
      setStatus("success");
    })();
  }, []);

  useEffect(() => {
    if (status !== "success") return;
    // A full navigation (not the Next.js client router) so the destination
    // page reads the session cookie fresh instead of picking up this tab's
    // not-yet-subscribed session store, which was leaving the admin/dashboard
    // auth gate briefly rendering its signed-out state after this redirect.
    const timer = setTimeout(() => {
      window.location.assign(destination);
    }, 2500);
    return () => clearTimeout(timer);
  }, [status, destination]);

  return (
    <main className="mx-auto grid min-h-screen max-w-md items-center px-6 text-center">
      {status === "verifying" && <p className="text-slate-600">Signing you in…</p>}

      {status === "success" && (
        <div>
          <CheckCircle2 className="mx-auto mb-4 text-[hsl(var(--primary))]" size={48} />
          <p className="mb-2 text-xl font-semibold text-slate-900">
            You&apos;re all set
          </p>
          <p className="mb-6 text-sm text-slate-600">
            You are signed in. You can close this tab, or continue to your{" "}
            {destination === "/admin" ? "admin console" : "dashboard"}.
          </p>
          <a
            href={destination}
            className="rounded-xl bg-[hsl(var(--primary-button))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-button-foreground))] hover:bg-[hsl(var(--primary-button-hover))]"
          >
            Continue
          </a>
        </div>
      )}

      {status === "error" && (
        <div>
          <p className="mb-3 text-lg font-semibold text-slate-900">
            Couldn&apos;t sign you in
          </p>
          <p className="mb-6 text-sm text-slate-600">{error}</p>
          <a
            href="/sign-in"
            className="rounded-xl bg-[hsl(var(--primary-button))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-button-foreground))] hover:bg-[hsl(var(--primary-button-hover))]"
          >
            Back to sign in
          </a>
        </div>
      )}
    </main>
  );
}
