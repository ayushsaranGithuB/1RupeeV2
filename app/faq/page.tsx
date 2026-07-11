const faqSections = [
  {
    title: "Getting started",
    items: [
      {
        question: "What is 1Rupee?",
        answer:
          "1Rupee is a recurring giving platform. Instead of one large donation, you commit a small daily amount to a cause you care about, and it adds up to real, sustained support over time.",
      },
      {
        question: "Who can use 1Rupee?",
        answer:
          "Anyone 18 or older in India with a way to pay online — UPI, debit/credit card, or net banking — can sign up and start supporting campaigns.",
      },
      {
        question: "How do I get started?",
        answer:
          "Create an account, browse active campaigns, pick a tier on the campaign you want to support, and top up your wallet to activate your pledge.",
      },
    ],
  },
  {
    title: "Wallet & payments",
    items: [
      {
        question: "What is the wallet?",
        answer:
          "Your wallet holds a prepaid balance in rupees that funds your pledges. You top it up whenever you like, and every top-up and donation is recorded in your transaction history.",
      },
      {
        question: "What payment methods are supported?",
        answer:
          "You can top up your wallet via UPI, debit/credit card, or net banking.",
      },
      {
        question: "What happens if my wallet balance runs low?",
        answer:
          "If there isn't enough balance to cover a scheduled donation, that donation is skipped rather than putting your account in debt. Top up anytime to keep your pledges active.",
      },
    ],
  },
  {
    title: "Tiers & pledges",
    items: [
      {
        question: "What is a tier?",
        answer:
          "Each campaign offers one or more tiers — a fixed daily amount you can commit, along with what that support unlocks for the cause. You choose a tier and a plan length (for example 3, 6, or 12 months) when you pledge.",
      },
      {
        question: "What is a pledge, and is it recurring?",
        answer:
          "A pledge is your ongoing commitment to a tier for your chosen plan length. From your wallet balance, your daily amount is applied toward that campaign for as long as the pledge is active.",
      },
      {
        question: "Can I support multiple campaigns at once?",
        answer:
          "Yes. You can hold active pledges across as many different campaigns or tiers as you like — you just can't have two active pledges on the exact same tier at the same time.",
      },
      {
        question: "Can I pause or cancel a pledge?",
        answer:
          "Yes, you can manage your active pledges from your dashboard at any time.",
      },
    ],
  },
  {
    title: "Transparency & trust",
    items: [
      {
        question: "How are campaigns vetted?",
        answer:
          "Every campaign is reviewed before it goes live, and we track how much each one has raised so contributors can see progress toward its goal.",
      },
      {
        question: "How can I see where my money went?",
        answer:
          "Your dashboard shows every donation and top-up in your wallet history, tied to the specific campaigns you've supported.",
      },
      {
        question: "Do I get a tax receipt for my donations?",
        answer:
          "Not yet — tax-deductible receipts aren't available on the platform today, but it's something we're looking into.",
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
      <h1 className="mb-4 text-4xl font-bold text-[#4A88B8]  font-kalam">
        Frequently Asked Questions
      </h1>
      <p className="mb-12 text-lg text-slate-500">
        Everything you need to know about giving with 1Rupee. Can&apos;t find
        what you&apos;re looking for? Reach out anytime.
      </p>

      <div>
        {faqSections.map((section) => (
          <section key={section.title} className="mb-[4em]">
            <h2 className="text-2xl font-semibold  text-[#4A88B8]  font-kalam">
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
