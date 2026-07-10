export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Cookie Policy</h1>

      <div className="prose prose-slate max-w-none space-y-8 text-slate-600">
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">What Are Cookies?</h2>
          <p>
            Cookies are small text files that are stored on your device when you visit our website. They help us remember your preferences and understand how you use our platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Types of Cookies We Use</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900">Essential Cookies</h3>
              <p>
                These cookies are necessary for the platform to function properly. They enable you to navigate the platform and use its features.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Preference Cookies</h3>
              <p>
                These cookies remember your preferences and settings so we can provide a personalized experience.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Analytics Cookies</h3>
              <p>
                These cookies help us understand how visitors use our platform so we can improve it.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Managing Cookies</h2>
          <p>
            You can control and delete cookies through your browser settings. Most browsers allow you to refuse cookies or alert you when they are being sent. However, please note that blocking cookies may affect your ability to use certain features of our platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Contact Us</h2>
          <p>
            If you have questions about this Cookie Policy, please contact us at cookies@1rupee.app.
          </p>
        </section>

        <p className="text-sm text-slate-500 mt-12">
          Last updated: 2026
        </p>
      </div>
    </div>
  );
}
