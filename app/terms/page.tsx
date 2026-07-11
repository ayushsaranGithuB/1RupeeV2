export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Terms of Service</h1>

      <div className="prose prose-slate max-w-none space-y-8 text-slate-600">
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Agreement to Terms</h2>
          <p>
            By accessing and using the 1Rupee platform, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) on 1Rupee for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to decompile or reverse engineer any software contained on the platform</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
            <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Disclaimer</h2>
          <p>
            The materials on 1Rupee are provided "as is". 1Rupee makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Limitations</h2>
          <p>
            In no event shall 1Rupee or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the 1Rupee platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Accuracy of Materials</h2>
          <p>
            The materials appearing on 1Rupee could include technical, typographical, or photographic errors. 1Rupee does not warrant that any of the materials on its platform are accurate, complete, or current.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Contact Us</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at terms@1rupee.app.
          </p>
        </section>

        <p className="text-sm text-slate-500 mt-12">
          Last updated: 2026
        </p>
      </div>
    </div>
  );
}
