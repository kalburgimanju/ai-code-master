import Link from 'next/link';
import { Sparkles } from 'lucide-react';

const footerLinks = {
  Products: [
    { href: '/products#video-generator', label: 'AI Video Generator' },
    { href: '/products#ai-employee', label: 'AI Employee' },
    { href: '/products#travel-agency', label: 'AI Travel Agency' },
    { href: '/products#yt-faceless', label: 'YT Faceless' },
    { href: '/products#bootcamp', label: 'Bootcamp Platform' },
    { href: '/products#portfolio', label: 'Portfolio Builder' },
  ],
  Services: [
    { href: '/services#ai-solutions', label: 'AI Solutions' },
    { href: '/services#content-marketing', label: 'Content Marketing' },
    { href: '/services#film-making', label: 'Film & Ads' },
    { href: '/services#social-media', label: 'Social Media Strategy' },
    { href: '/services#newsletter', label: 'Newsletter Writing' },
    { href: '/services#startup-advisory', label: 'Startup Advisory' },
  ],
  Company: [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/policy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-dark-900 text-dark-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-extrabold text-xl text-white mb-4">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-fire-500 flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </span>
              NexusAI
            </Link>
            <p className="text-sm text-dark-400 leading-relaxed">
              AI-driven SaaS products and services that empower businesses to move faster, create smarter, and scale effortlessly.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-bold text-white uppercase tracking-wide mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-dark-400 hover:text-brand-400 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-dark-700 text-center text-xs text-dark-500">
          &copy; {new Date().getFullYear()} NexusAI. All rights reserved. Built with AI.
        </div>
      </div>
    </footer>
  );
}
