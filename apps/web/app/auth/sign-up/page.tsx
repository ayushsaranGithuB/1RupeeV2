import Link from "next/link";

export default function SignUpPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-5xl items-center px-6 py-10 sm:px-10">
      <section className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg">
        <h1 className="mb-2 text-4xl text-slate-900">Create your account</h1>
        <p className="mb-6 text-slate-600">
          Start supporting causes with a simple daily habit.
        </p>

        <form className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Full name
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              type="text"
              placeholder="Your name"
            />
          </label>
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
              placeholder="Create a password"
            />
          </label>
          <button
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700"
            type="button"
          >
            Create account
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-semibold text-emerald-700" href="/auth/sign-in">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
