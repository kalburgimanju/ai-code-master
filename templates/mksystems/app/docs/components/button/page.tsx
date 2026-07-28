import Link from "next/link";
import Button from "@/components/Button";

export default function ButtonDoc() {
  return (
    <div>
      <nav className="text-sm text-neutral-400 mb-6">
        <Link href="/docs/components" className="hover:text-brand-600">Components</Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-700">Button</span>
      </nav>

      <h1>Button</h1>
      <p>Interactive button with multiple variants, sizes, and loading states.</p>

      <h2>Import</h2>
      <pre><code>{`import { Button } from 'mksystems';`}</code></pre>

      <h2>Variants</h2>
      <div className="flex flex-wrap gap-3 not-prose my-4">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </div>
      <pre><code>{`<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>`}</code></pre>

      <h2>Sizes</h2>
      <div className="flex items-center gap-3 not-prose my-4">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
      <pre><code>{`<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`}</code></pre>

      <h2>Loading State</h2>
      <div className="flex gap-3 not-prose my-4">
        <Button loading>Saving...</Button>
        <Button variant="secondary" loading>Loading</Button>
      </div>
      <pre><code>{`<Button loading>Saving...</Button>`}</code></pre>

      <h2>Disabled</h2>
      <div className="flex gap-3 not-prose my-4">
        <Button disabled>Disabled</Button>
      </div>
      <pre><code>{`<Button disabled>Disabled</Button>`}</code></pre>

      <h2>Props</h2>
      <div className="not-prose">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="text-left py-2 font-semibold text-neutral-700">Prop</th>
              <th className="text-left py-2 font-semibold text-neutral-700">Type</th>
              <th className="text-left py-2 font-semibold text-neutral-700">Default</th>
              <th className="text-left py-2 font-semibold text-neutral-700">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">variant</td>
              <td className="py-2 text-xs text-neutral-500">"primary" | "secondary" | "ghost" | "outline" | "danger"</td>
              <td className="py-2 text-xs text-neutral-500">"primary"</td>
              <td className="py-2 text-xs text-neutral-500">Visual style</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">size</td>
              <td className="py-2 text-xs text-neutral-500">"sm" | "md" | "lg"</td>
              <td className="py-2 text-xs text-neutral-500">"md"</td>
              <td className="py-2 text-xs text-neutral-500">Size preset</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">loading</td>
              <td className="py-2 text-xs text-neutral-500">boolean</td>
              <td className="py-2 text-xs text-neutral-500">false</td>
              <td className="py-2 text-xs text-neutral-500">Show spinner and disable</td>
            </tr>
            <tr>
              <td className="py-2 font-mono text-xs text-brand-600">disabled</td>
              <td className="py-2 text-xs text-neutral-500">boolean</td>
              <td className="py-2 text-xs text-neutral-500">false</td>
              <td className="py-2 text-xs text-neutral-500">Disable interaction</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
