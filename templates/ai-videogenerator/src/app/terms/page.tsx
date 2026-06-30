export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-dark-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-dark-400 mb-8">Last updated: June 30, 2026</p>

      <div className="prose prose-dark max-w-none space-y-6 text-sm text-dark-600 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using AI Video Generator (the &quot;Application&quot;), you agree to be bound
            by these Terms of Service. If you do not agree to these terms, do not use the Application.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-2">2. Description of Service</h2>
          <p>
            AI Video Generator provides a web-based platform that allows you to record videos
            using your device&apos;s camera and upload them directly to your connected YouTube channel.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-2">3. User Responsibilities</h2>
          <p>You agree to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Use the Application in compliance with all applicable laws and regulations.</li>
            <li>Only upload content that you have the right to publish on YouTube.</li>
            <li>Not use the Application for any unlawful, harmful, or abusive purpose.</li>
            <li>Not attempt to gain unauthorized access to any part of the Application or its systems.</li>
            <li>Not use the Application to distribute spam, malware, or other harmful content.</li>
            <li>Maintain the security of your Google/YouTube account credentials.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-2">4. Content Ownership</h2>
          <p>
            You retain all rights to the videos and content you create and upload through
            the Application. We do not claim ownership over your content. By uploading content,
            you grant us a limited license to process and transmit that content to YouTube
            on your behalf.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-2">5. YouTube API Usage</h2>
          <p>
            Our Application uses the YouTube Data API. Your use of the YouTube API through
            our Application is also subject to the{' '}
            <a
              href="https://developers.google.com/youtube/terms/api-services-terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:text-brand-700 underline"
            >
              YouTube API Terms of Service
            </a>
            . By using our Application, you acknowledge that you are also bound by YouTube&apos;s terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-2">6. Prohibited Uses</h2>
          <p>You must not:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Upload content that violates YouTube&apos;s Community Guidelines.</li>
            <li>Upload copyrighted material without proper authorization.</li>
            <li>Use automated tools to abuse or overload the Application.</li>
            <li>Impersonate any person or entity.</li>
            <li>Collect or harvest data from other users without their consent.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-2">7. Disclaimer of Warranties</h2>
          <p>
            The Application is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
            either express or implied. We do not warrant that the Application will be uninterrupted,
            error-free, or secure.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-2">8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, we shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages, or any loss of profits or
            revenues, whether incurred directly or indirectly, arising from your use of the Application.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-2">9. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your access to the Application at any
            time, with or without cause, and with or without notice. You may also disconnect
            your account at any time.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-2">10. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms of Service at any time. We will notify
            you of any changes by posting the new terms on this page. Your continued use of
            the Application after any changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-dark-900 mb-2">11. Contact</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at
            manjunathkhubli85@gmail.com.
          </p>
        </section>
      </div>
    </div>
  );
}
