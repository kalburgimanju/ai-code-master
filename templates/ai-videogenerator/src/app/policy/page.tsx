export default function PolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-dark-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-dark-400 mb-8">Last updated: June 30, 2026</p>

      <div className="prose prose-dark max-w-none space-y-6 text-sm text-dark-600 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-2">1. Introduction</h2>
          <p>
            Welcome to AI Video Generator (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We are committed to protecting your personal information
            and your right to privacy. This Privacy Policy explains how we collect, use, disclose,
            and safeguard your information when you use our application.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-2">2. Information We Collect</h2>
          <p>We may collect information that you provide directly to us, including:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Account Information:</strong> When you connect your YouTube account via Google OAuth, we receive your YouTube channel name, channel ID, profile thumbnail, and subscriber count.</li>
            <li><strong>Video Content:</strong> Videos you record and upload through our application.</li>
            <li><strong>Video Metadata:</strong> Titles, descriptions, tags, and privacy settings you provide for your uploaded videos.</li>
            <li><strong>Usage Data:</strong> Information about how you interact with our application, such as features used and time spent.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-2">3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Provide, operate, and maintain our application.</li>
            <li>Upload your recorded videos to your connected YouTube channel.</li>
            <li>Improve, personalize, and expand our application.</li>
            <li>Understand and analyze how you use our application.</li>
            <li>Communicate with you, including for customer service and updates.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-2">4. Data Storage and Security</h2>
          <p>
            We use commercially reasonable measures to protect your personal information.
            However, no method of transmission over the Internet or method of electronic
            storage is 100% secure. We store your OAuth tokens securely and never share
            them with third parties.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-2">5. Third-Party Services</h2>
          <p>Our application integrates with:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Google YouTube API Services:</strong> To authenticate your YouTube account and upload videos. Your use of Google APIs is subject to Google&apos;s Privacy Policy.</li>
            <li><strong>Netlify:</strong> Our hosting provider, which may collect certain technical information.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-2">6. Data Retention</h2>
          <p>
            We retain your information only for as long as necessary to provide you with
            our services. You may disconnect your YouTube account at any time, which will
            remove your stored tokens and channel information from our servers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-2">7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Access the personal information we hold about you.</li>
            <li>Request deletion of your personal information.</li>
            <li>Disconnect your YouTube account at any time.</li>
            <li>Opt out of any non-essential data collection.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-2">8. Children&apos;s Privacy</h2>
          <p>
            Our application is not intended for use by children under the age of 13.
            We do not knowingly collect personal information from children under 13.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-2">9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you
            of any changes by posting the new Privacy Policy on this page and updating
            the &quot;Last updated&quot; date.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-2">10. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at
            manjunathkhubli85@gmail.com.
          </p>
        </section>
      </div>
    </div>
  );
}
