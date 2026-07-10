"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type Status = "verifying" | "success" | "error";

// Landing page for the magic-link email. Completes verification via the auth
// client (JSON response through the proxy, so the session cookie is set on this
// origin), shows a confirmation, then auto-continues to the right destination.
export default function VerifyPage() {
  const router = useRouter();
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
    const timer = setTimeout(() => router.replace(destination), 2500);
    return () => clearTimeout(timer);
  }, [status, destination, router]);

  return (
    <main className="mx-auto grid min-h-screen max-w-md items-center px-6 text-center">
      {status === "verifying" && <p className="text-slate-600">Signing you in…</p>}

      {status === "success" && (
        <div>
          <CheckCircle2 className="mx-auto mb-4 text-emerald-600" size={48} />
          <p className="mb-2 text-xl font-semibold text-slate-900">
            You&apos;re all set
          </p>
          <p className="mb-6 text-sm text-slate-600">
            You are signed in. You can close this tab, or continue to your{" "}
            {destination === "/admin" ? "admin console" : "dashboard"}.
          </p>
          <a
            href={destination}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
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
            href="/auth/sign-in"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Back to sign in
          </a>
        </div>
      )}
    </main>
  );
}
