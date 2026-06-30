import Link from 'next/link';

export default function PolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-extrabold text-dark-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-dark-400 mb-8">Last updated: June 30, 2026</p>

      <div className="prose prose-dark max-w-none space-y-8 text-sm text-dark-600 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-3">1. Introduction</h2>
          <p>
            Welcome to NexusAI (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We are committed to protecting your personal information
            and your right to privacy. This Privacy Policy explains how we collect, use, disclose,
            and safeguard your information when you use our website and AI-powered products.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-3">2. Information We Collect</h2>
          <p>We may collect information that you provide directly to us, including:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Account Information:</strong> When you sign up or connect third-party services (e.g., YouTube via Google OAuth), we receive your channel name, ID, profile thumbnail, and subscriber count.</li>
            <li><strong>Content Data:</strong> Videos you record, upload, or generate through our AI tools.</li>
            <li><strong>Metadata:</strong> Titles, descriptions, tags, and settings you provide for your content.</li>
            <li><strong>Contact Information:</strong> Name, email, and message when you fill out our contact form.</li>
            <li><strong>Usage Data:</strong> Information about how you interact with our products and services.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-3">3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Provide, operate, and maintain our AI products and services.</li>
            <li>Process content uploads and integrate with third-party platforms (e.g., YouTube).</li>
            <li>Improve, personalize, and expand our products using AI.</li>
            <li>Communicate with you, including for customer support and service updates.</li>
            <li>Analyze usage patterns to improve user experience.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-3">4. AI and Data Processing</h2>
          <p>
            Our products use artificial intelligence to generate content, automate workflows, and provide
            insights. AI processing may occur on our servers or through third-party AI providers (e.g.,
            OpenAI, Google Cloud). We do not use your personal data to train AI models without your
            explicit consent.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-3">5. Third-Party Services</h2>
          <p>Our products integrate with:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Google YouTube API:</strong> For video upload and channel management. Subject to Google&apos;s Privacy Policy.</li>
            <li><strong>AI Providers:</strong> For content generation and processing.</li>
            <li><strong>Netlify / Vercel:</strong> For hosting. May collect technical information.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-3">6. Data Retention</h2>
          <p>
            We retain your information only for as long as necessary to provide you with our services.
            You may disconnect third-party accounts at any time, which will remove stored tokens and
            related data from our servers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-3">7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Access the personal information we hold about you.</li>
            <li>Request deletion of your personal information.</li>
            <li>Disconnect third-party accounts at any time.</li>
            <li>Opt out of non-essential data collection.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-3">8. Children&apos;s Privacy</h2>
          <p>
            Our products are not intended for use by children under 13. We do not knowingly collect
            personal information from children under 13.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-3">9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes
            by posting the new policy on this page and updating the &quot;Last updated&quot; date.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-3">10. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us via{' '}
            <Link href="/contact" className="text-brand-600 hover:text-brand-700 underline">nexusai.dev</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
