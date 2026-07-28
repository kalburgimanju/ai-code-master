import Link from "next/link";
import { Download, Palette, Layers, Zap } from "lucide-react";

export default function DocsPage() {
  return (
    <div>
      <h1>MKSystems Design System</h1>
      <p>
        Welcome to <strong>MKSystems</strong> — a modern, open-source design system
        with production-ready React components, design tokens, and comprehensive
        documentation.
      </p>

      <h2>Quick Start</h2>
      <h3>1. Install</h3>
      <pre><code>{`npm install mksystems`}</code></pre>

      <h3>2. Import Components</h3>
      <pre><code>{`import { Button, Card, Input } from 'mksystems';

function App() {
  return (
    <Card padding="lg">
      <h2>Welcome</h2>
      <Input label="Email" placeholder="you@example.com" />
      <Button variant="primary">Submit</Button>
    </Card>
  );
}`}</code></pre>

      <h3>3. That&apos;s it!</h3>
      <p>
        No providers, no configuration, no theme wrappers. Just import and use.
      </p>

      <h2>Why MKSystems?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose my-4">
        {[
          { icon: Zap, title: "Zero Config", desc: "No setup required. Copy-paste components." },
          { icon: Layers, title: "Composable", desc: "Mix and match components freely." },
          { icon: Palette, title: "Themed", desc: "CSS custom properties for easy theming." },
          { icon: Download, title: "Lightweight", desc: "Tree-shakeable. Only ship what you use." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex gap-3 p-4 bg-neutral-50 rounded-xl">
            <Icon className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-neutral-900">{title}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h2>Next Steps</h2>
      <ul>
        <li>
          <Link href="/docs/tokens" className="text-brand-600 hover:underline">
            Design Tokens
          </Link>{" "}
          — learn about colors, spacing, and typography
        </li>
        <li>
          <Link href="/docs/components" className="text-brand-600 hover:underline">
            Components
          </Link>{" "}
          — browse the full component library
        </li>
        <li>
          <Link href="/portal" className="text-brand-600 hover:underline">
            Admin Portal
          </Link>{" "}
          — track downloads and usage
        </li>
      </ul>
    </div>
  );
}
