"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, phoneAuth } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const router = useRouter();
  const [showPhone, setShowPhone] = useState(false);

  // Email magic link
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // Phone OTP
  const [phone, setPhone] = useState("+91");
  const [otpRequested, setOtpRequested] = useState(false);
  const [code, setCode] = useState("0000");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signIn.magicLink({
      email,
      name: email.split("@")[0],
      callbackURL: "/dashboard",
    });
    setLoading(false);
    if (error) {
      setError(error.message || "Could not send the sign-in link.");
      return;
    }
    setEmailSent(true);
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await phoneAuth.sendOtp({ phoneNumber: phone });
    setLoading(false);
    if (error) {
      setError(error.message || "Could not send the OTP.");
      return;
    }
    setOtpRequested(true);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await phoneAuth.verify({
      phoneNumber: phone,
      code,
    });
    setLoading(false);
    if (error) {
      setError(error.message || "Invalid or expired code.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-5xl items-center px-6 py-10 sm:px-10">
      <section className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg">
        <h1 className="mb-2 text-4xl text-slate-900">Welcome back</h1>
        <p className="mb-6 text-slate-600">
          Passwordless sign-in — no password needed.
        </p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {emailSent ? (
          <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
            <p className="font-semibold">Check your email</p>
            <p className="mt-1">
              We sent a sign-in link to <strong>{email}</strong>. In local dev
              the link is printed in the API server console.
            </p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleMagicLink}>
            <label className="block text-sm font-medium text-slate-700">
              Email
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
              className="w-full cursor-pointer rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending…" : "Send magic link"}
            </Button>
          </form>
        )}

        {!emailSent && (
          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            {!showPhone ? (
              <button
                type="button"
                className="cursor-pointer text-sm font-medium text-slate-500 hover:text-emerald-700"
                onClick={() => {
                  setShowPhone(true);
                  setError(null);
                }}
              >
                Sign in with phone instead
              </button>
            ) : otpRequested ? (
              <form className="space-y-4 text-left" onSubmit={handleVerifyOtp}>
                <label className="block text-sm font-medium text-slate-700">
                  Enter the code sent to {phone}
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 tracking-[0.5em]"
                    inputMode="numeric"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="0000"
                  />
                </label>
                <p className="text-xs text-slate-500">
                  Dev mode: the code is <strong>0000</strong>.
                </p>
                <Button
                  className="w-full cursor-pointer rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Verifying…" : "Verify & sign in"}
                </Button>
                <button
                  type="button"
                  className="w-full cursor-pointer text-sm text-slate-500 hover:text-slate-700"
                  onClick={() => {
                    setOtpRequested(false);
                    setError(null);
                  }}
                >
                  Use a different number
                </button>
              </form>
            ) : (
              <form className="space-y-4 text-left" onSubmit={handleSendOtp}>
                <label className="block text-sm font-medium text-slate-700">
                  Phone number
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </label>
                <Button
                  className="w-full cursor-pointer rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Sending…" : "Send OTP"}
                </Button>
                <button
                  type="button"
                  className="w-full cursor-pointer text-sm text-slate-500 hover:text-slate-700"
                  onClick={() => {
                    setShowPhone(false);
                    setError(null);
                  }}
                >
                  Use email instead
                </button>
              </form>
            )}
          </div>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          New to 1Rupee?{" "}
          <Link
            href="/auth/sign-up"
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
