import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-extrabold text-dark-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-dark-400 mb-8">Last updated: June 30, 2026</p>

      <div className="prose prose-dark max-w-none space-y-8 text-sm text-dark-600 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using NexusAI products and services (&quot;Service&quot;), you agree to be bound
            by these Terms of Service. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-3">2. Description of Service</h2>
          <p>
            NexusAI provides AI-powered SaaS products including but not limited to video generation tools,
            AI employee assistants, travel planning platforms, YouTube channel automation, bootcamp platforms,
            and developer portfolio builders. We also offer content marketing, film production, social media
            strategy, newsletter writing, and startup advisory services.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-3">3. User Responsibilities</h2>
          <p>You agree to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Use the Service in compliance with all applicable laws and regulations.</li>
            <li>Only upload or generate content that you have the right to publish.</li>
            <li>Not use the Service for any unlawful, harmful, or abusive purpose.</li>
            <li>Not attempt to gain unauthorized access to any part of the Service.</li>
            <li>Not use automated tools to abuse or overload the Service.</li>
            <li>Maintain the security of your account credentials.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-3">4. Content Ownership</h2>
          <p>
            You retain all rights to the content you create and upload through our Service. We do not
            claim ownership over your content. By uploading content, you grant us a limited license to
            process and transmit that content to third-party platforms (e.g., YouTube) on your behalf.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-3">5. AI-Generated Content</h2>
          <p>
            Our Service uses artificial intelligence to generate content and automate workflows. You are
            responsible for reviewing all AI-generated content before publishing. We do not guarantee the
            accuracy, completeness, or originality of AI-generated content.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-3">6. Third-Party Integrations</h2>
          <p>
            Our Service integrates with third-party platforms (e.g., YouTube, Google). Your use of these
            integrations is also subject to their respective terms of service. We are not responsible for
            the actions or policies of third-party services.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-3">7. Prohibited Uses</h2>
          <p>You must not:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Generate or upload content that violates platform community guidelines.</li>
            <li>Upload copyrighted material without proper authorization.</li>
            <li>Impersonate any person or entity.</li>
            <li>Collect or harvest data from other users without their consent.</li>
            <li>Distribute spam, malware, or other harmful content.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-3">8. Disclaimer of Warranties</h2>
          <p>
            The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
            either express or implied. We do not warrant that the Service will be uninterrupted,
            error-free, or secure.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-3">9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, NexusAI shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages arising from your use of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-3">10. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify you of any changes
            by posting the new terms on this page. Your continued use of the Service after changes
            constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-3">11. Contact</h2>
          <p>
            If you have any questions about these Terms, please contact us via{' '}
            <Link href="/contact" className="text-brand-600 hover:text-brand-700 underline">nexusai.dev</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
