const faqSections = [
  {
    title: "Getting started",
    items: [
      {
        question: "What is 1Rupee?",
        answer:
          "1Rupee is a recurring giving platform built around a simple idea: small, steady amounts add up to more impact than the occasional big gift — and they're a lot easier on your budget too. Instead of a one-time donation, you pick a cause and commit a small amount to it every day. You can watch your chosen campaigns' progress build up in your dashboard, day by day, as your contributions add up alongside everyone else supporting the same cause.",
      },
      {
        question: "Who can use 1Rupee?",
        answer:
          "Anyone 18 or older in India can sign up, as long as you have a way to pay online — UPI, a debit or credit card, or net banking all work. Signing up takes a couple of minutes: verify your phone or email, and you're ready to browse campaigns and set up your first pledge.",
      },
      {
        question: "How do I get started?",
        answer:
          "It's four quick steps: create your account, browse active campaigns and pick one that speaks to you, choose a tier and a plan length on that campaign, then extend your impact by adding funds to activate your pledge. From there, everything runs on its own — you can check in on your dashboard whenever you like to see the impact adding up and your donation runway.",
      },
    ],
  },
  {
    title: "Donation Runway & payments",
    items: [
      {
        question: "What is donation runway?",
        answer:
          "Your donation runway is how many days your current funds will continue supporting all of your active causes. Instead of thinking about how much money you have left, we help you think about how long your generosity will continue. When you fund ₹500 and your daily commitment is ₹5/day, that's 100 days of impact. Every extension you make adds more days to your runway.",
      },
      {
        question: "What payment methods are supported?",
        answer:
          "You can extend your impact using UPI, a debit or credit card, or net banking — whatever's easiest for you. Just choose an amount, complete the payment, and your donation runway updates instantly so you can see how many more days you're funded for.",
      },
      {
        question: "What happens if my donation runway runs out?",
        answer:
          "Nothing to worry about — if your funds run out, your support simply pauses rather than leaving you in debt or charging you extra. Your pledges stay set up and waiting, so a quick extension whenever you get the chance is all it takes to pick right back up and continue supporting the causes you care about.",
      },
    ],
  },
  {
    title: "Tiers & pledges",
    items: [
      {
        question: "What is a tier?",
        answer:
          "Every campaign offers one or more tiers to choose from — say, ₹5 a day or ₹20 a day — each with its own description of what that level of support helps make possible. When you pick a tier, you also choose how long you want to commit: a preset 3, 6, or 12 months, or a custom length anywhere from 1 to 12 months. Before you confirm, you'll see the full total for your chosen plan so there are no surprises.",
      },
      {
        question: "What is a pledge, and is it recurring?",
        answer:
          "A pledge is what you get when you commit to a tier — it's your ongoing promise to support that campaign for the plan length you picked. Once it's active, your daily amount is drawn from your wallet balance and added to that campaign's total, day after day, alongside everyone else's contributions, for as long as your pledge runs.",
      },
      {
        question: "Can I support multiple campaigns at once?",
        answer:
          "Definitely — there's no limit on how many different campaigns or tiers you can back at the same time. Mix and match causes however you like; the only rule is that you can't hold two active pledges on the exact same tier simultaneously (you'd just be topping up the same commitment twice).",
      },
      {
        question: "Can I pause or cancel a pledge?",
        answer:
          "Yes, your pledges are always yours to manage. Head to your dashboard to pause a pledge if you want to take a break without losing your history, or cancel it outright if your priorities change. Either way, any remaining wallet balance stays right where it is, ready for you to put toward another cause.",
      },
    ],
  },
  {
    title: "Transparency & trust",
    items: [
      {
        question: "How are campaigns vetted?",
        answer:
          "Our team reviews every campaign before it's allowed to go live on the platform. Once it's up, you'll see its progress toward its goal in real time, and our team keeps an eye on each campaign's status throughout its life — pausing, wrapping up, or archiving it as needed.",
      },
      {
        question: "How can I see where my money went?",
        answer:
          "Your dashboard is your full paper trail — every top-up and every donation is logged there, date-stamped and tied to the specific campaign it supported. Nothing about your giving history is hidden from you; it's all just a click away.",
      },
      {
        question: "Do I get a tax receipt for my donations?",
        answer:
          "Not yet — tax-deductible receipts aren't something we offer on the platform today. It's on our radar, and we're looking into partnerships that would make that possible down the line. In the meantime, your dashboard's transaction history is a complete, dated record of everything you've given, which is handy to have either way.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:px-10">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-400">
        Have questions?
      </p>
      <h1 className="mb-4 text-4xl font-bold text-primary font-geist">
        Frequently Asked Questions
      </h1>
      <p className="mb-12 text-lg text-slate-500">
        Everything you need to know about giving with 1Rupee. Can&apos;t find
        what you&apos;re looking for? Reach out anytime.
      </p>

      <div>
        {faqSections.map((section) => (
          <section key={section.title} className="mb-[4em]">
            <h2 className="text-2xl font-semibold text-primary font-geist">
              {section.title}
            </h2>
            <div className="space-y-3">
              {section.items.map((item) => (
                <div
                  key={item.question}
                  className="p-2 open:border-emerald-200 open:bg-emerald-50/40"
                >
                  <p className="cursor-pointer list-none font-medium text-slate-900 marker:content-none">
                    <span className="flex items-center justify-between gap-4">
                      {item.question}
                    </span>
                  </p>
                  <p className="mt-3 text-md text-slate-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
