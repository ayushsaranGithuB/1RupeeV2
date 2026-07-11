import Link from "next/link";
import { Eye, Users, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/avatar";

const values = [
  {
    icon: Eye,
    title: "Transparency",
    description:
      "Every rupee is tracked from the moment it's given to the moment it reaches a project. We report openly across every cause category so you always know where your contribution went.",
  },
  {
    icon: Users,
    title: "Democracy",
    description:
      "This isn't a top-down charity. Our community decides which causes get support — your daily ₹1 is a vote for the change you want to see.",
  },
  {
    icon: ShieldCheck,
    title: "Trust",
    description:
      "We hold ourselves accountable for every decision and every rupee, because lasting impact is built on relationships, not transactions.",
  },
];

const team = [
  {
    name: "Abhishek Hingorani",
    role: "Founder",
    bio: "A marketer with a background in technology and social innovation, Abhishek started 1Rupee to turn giving into a daily habit rather than an occasional act.",
  },
  {
    name: "Ayush Saran",
    role: "Co-Founder",
    bio: "A UI/UX designer and developer based in Bir, Himachal Pradesh, Ayush builds the product experience that makes giving effortless.",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-white">
      <section className="px-6 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
            Our story
          </p>
          <h1 className="mb-6 text-4xl font-bold text-slate-900 sm:text-5xl">
            About Us
          </h1>
          <p className="text-lg text-slate-600">
            1Rupee is built on a simple idea: real change doesn&apos;t need
            deep pockets, it needs many hands. By turning everyday pocket
            change into a daily habit of giving, we&apos;re showing that a
            community acting together can move more than any single donor
            ever could.
          </p>
        </div>
      </section>

      <section className="bg-emerald-50/50 px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              What we stand for
            </h2>
            <p className="mt-3 text-slate-600">
              At 1Rupee, our values aren&apos;t just words on a webpage —
              they&apos;re the principles that guide every decision we make.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <value.icon size={20} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  {value.title}
                </h3>
                <p className="text-sm text-slate-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Our team
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {team.map((member) => (
              <div
                key={member.name}
                className="flex gap-4 rounded-2xl border border-slate-200 p-6"
              >
                <Avatar name={member.name} size="lg" />
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {member.name}
                  </h3>
                  <p className="mb-2 text-sm font-medium text-emerald-700">
                    {member.role}
                  </p>
                  <p className="text-sm text-slate-600">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-3xl rounded-2xl bg-emerald-600 px-8 py-12 text-center">
          <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
            Join 1 million daily givers
          </h2>
          <p className="mb-6 text-emerald-50">
            That&apos;s our goal, and every registration gets us closer to a
            community that can fund lasting change, one rupee at a time.
          </p>
          <Link
            href="/sign-up"
            className="inline-block rounded-full bg-white px-6 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            Register now
          </Link>
        </div>
      </section>
    </main>
  );
}
