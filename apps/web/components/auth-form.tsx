"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";

type RegisterResponse = {
  success: boolean;
  error?: { code: string; message: string };
};

export function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/proxy/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone }),
    });
    const body = (await res.json()) as RegisterResponse;

    if (!body.success) {
      setLoading(false);
      setError(body.error?.message || "Could not create your account.");
      return;
    }

    const { error: magicLinkError } = await signIn.magicLink({
      email,
      name,
      callbackURL: "/dashboard",
    });
    setLoading(false);
    if (magicLinkError) {
      setError(magicLinkError.message || "Could not send the sign-in link.");
      return;
    }
    setSubmitted(true);
  }

  return (
    <section className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg">
      <h1 className="mb-2 text-4xl text-slate-900">Create your account</h1>
      <p className="mb-6 text-slate-600">
        No password to set — we&apos;ll email you a sign-in link.
      </p>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {submitted ? (
        <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
          <p className="font-semibold">Check your email</p>
          <p className="mt-1">
            We sent a sign-in link to <strong>{email}</strong>. In local dev
            the link is printed in the API server console.
          </p>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
          </label>
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
          <label className="block text-sm font-medium text-slate-700">
            Phone number
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              type="tel"
              required
              pattern="\+91\d{10}"
              title="Enter a 10-digit number after +91"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </label>
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Sign in
        </Link>
      </p>
    </section>
  );
}
