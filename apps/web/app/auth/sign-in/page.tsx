import Link from "next/link";

export default function SignInPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-5xl items-center px-6 py-10 sm:px-10">
      <section className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg">
        <h1 className="mb-2 text-4xl text-slate-900">Welcome back</h1>
        <p className="mb-6 text-slate-600">
          Sign in to continue your daily giving journey.
        </p>

        <form className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              type="email"
              placeholder="you@example.com"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              type="password"
              placeholder="••••••••"
            />
          </label>
          <button
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700"
            type="button"
          >
            Continue
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          New to 1Rupee?{" "}
          <Link className="font-semibold text-emerald-700" href="/auth/sign-up">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
