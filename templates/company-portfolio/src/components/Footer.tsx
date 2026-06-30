import Link from 'next/link';
import { Sparkles, ExternalLink } from 'lucide-react';

const footerLinks = {
  Products: [
    { href: 'https://ai-videogenerator.netlify.app', label: 'AI Video Generator', external: true },
    { href: '/products#ai-employee', label: 'AI Employee', external: false },
    { href: 'https://ai-travelagency.netlify.app', label: 'AI Travel Agency', external: true },
    { href: 'https://ai-youtube-channel.netlify.app', label: 'YT Faceless', external: true },
    { href: '/products#bootcamp', label: 'Bootcamp Platform', external: false },
    { href: '/products#portfolio', label: 'Portfolio Builder', external: false },
  ],
  Services: [
    { href: '/services#ai-solutions', label: 'AI Solutions', external: false },
    { href: '/services#content-marketing', label: 'Content Marketing', external: false },
    { href: '/services#film-making', label: 'Film & Ads', external: false },
    { href: '/services#social-media', label: 'Social Media Strategy', external: false },
    { href: '/services#newsletter', label: 'Newsletter Writing', external: false },
    { href: '/services#startup-advisory', label: 'Startup Advisory', external: false },
  ],
  Company: [
    { href: '/about', label: 'About Us', external: false },
    { href: '/contact', label: 'Contact', external: false },
    { href: '/policy', label: 'Privacy Policy', external: false },
    { href: '/terms', label: 'Terms of Service', external: false },
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
                    {l.external ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-sm text-dark-400 hover:text-brand-400 transition-colors inline-flex items-center gap-1">
                        {l.label}
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      <Link href={l.href} className="text-sm text-dark-400 hover:text-brand-400 transition-colors">
                        {l.label}
                      </Link>
                    )}
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
