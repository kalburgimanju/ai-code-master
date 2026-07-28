import Link from "next/link";
import Card from "@/components/Card";
import Button from "@/components/Button";

export default function CardDoc() {
  return (
    <div>
      <nav className="text-sm text-neutral-400 mb-6">
        <Link href="/docs/components" className="hover:text-brand-600">Components</Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-700">Card</span>
      </nav>

      <h1>Card</h1>
      <p>Content container with default, outlined, and elevated variants.</p>

      <h2>Import</h2>
      <pre><code>{`import { Card } from 'mksystems';`}</code></pre>

      <h2>Variants</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 not-prose my-4">
        <Card variant="default">
          <h3 className="font-semibold text-sm mb-1">Default</h3>
          <p className="text-xs text-neutral-500">Subtle border, clean look.</p>
        </Card>
        <Card variant="outlined">
          <h3 className="font-semibold text-sm mb-1">Outlined</h3>
          <p className="text-xs text-neutral-500">Bold border for emphasis.</p>
        </Card>
        <Card variant="elevated">
          <h3 className="font-semibold text-sm mb-1">Elevated</h3>
          <p className="text-xs text-neutral-500">Shadow for depth.</p>
        </Card>
      </div>
      <pre><code>{`<Card variant="default">Default</Card>
<Card variant="outlined">Outlined</Card>
<Card variant="elevated">Elevated</Card>`}</code></pre>

      <h2>Padding</h2>
      <div className="flex gap-4 not-prose my-4">
        <Card variant="outlined" padding="sm"><p className="text-xs">padding="sm"</p></Card>
        <Card variant="outlined" padding="md"><p className="text-xs">padding="md"</p></Card>
        <Card variant="outlined" padding="lg"><p className="text-xs">padding="lg"</p></Card>
      </div>

      <h2>With Content</h2>
      <Card variant="elevated" padding="lg" className="not-prose my-4 max-w-sm">
        <h3 className="font-semibold mb-2">Subscribe to our newsletter</h3>
        <p className="text-sm text-neutral-500 mb-4">Get the latest updates delivered to your inbox.</p>
        <Button variant="primary" size="sm">Subscribe</Button>
      </Card>

      <h2>Props</h2>
      <div className="not-prose">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="text-left py-2 font-semibold text-neutral-700">Prop</th>
              <th className="text-left py-2 font-semibold text-neutral-700">Type</th>
              <th className="text-left py-2 font-semibold text-neutral-700">Default</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">variant</td>
              <td className="py-2 text-xs text-neutral-500">"default" | "outlined" | "elevated"</td>
              <td className="py-2 text-xs text-neutral-500">"default"</td>
            </tr>
            <tr>
              <td className="py-2 font-mono text-xs text-brand-600">padding</td>
              <td className="py-2 text-xs text-neutral-500">"none" | "sm" | "md" | "lg"</td>
              <td className="py-2 text-xs text-neutral-500">"md"</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
