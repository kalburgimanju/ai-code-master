import Link from "next/link";
import { Box } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
                <Box className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-base font-bold text-white">
                MK<span className="text-brand-400">Systems</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              A modern design system with beautiful components, design tokens,
              and comprehensive documentation.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="/docs/components" className="hover:text-white transition-colors">Components</Link></li>
              <li><Link href="/docs/tokens" className="hover:text-white transition-colors">Design Tokens</Link></li>
              <li><Link href="/portal" className="hover:text-white transition-colors">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/docs" className="hover:text-white transition-colors">Getting Started</Link></li>
              <li><Link href="/docs/components/button" className="hover:text-white transition-colors">Button</Link></li>
              <li><Link href="/docs/components/card" className="hover:text-white transition-colors">Card</Link></li>
              <li><Link href="/docs/components/modal" className="hover:text-white transition-colors">Modal</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="cursor-default">MIT License</span></li>
              <li><span className="cursor-default">Privacy Policy</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} MKSystems. All rights reserved.
          </p>
          <p className="text-xs">
            Built with Next.js &amp; Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
