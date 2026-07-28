import Link from "next/link";
import Input from "@/components/Input";

export default function InputDoc() {
  return (
    <div>
      <nav className="text-sm text-neutral-400 mb-6">
        <Link href="/docs/components" className="hover:text-brand-600">Components</Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-700">Input</span>
      </nav>

      <h1>Input</h1>
      <p>Text input with label, error, and helper text support.</p>

      <h2>Import</h2>
      <pre><code>{`import { Input } from 'mksystems';`}</code></pre>

      <h2>Basic Usage</h2>
      <div className="not-prose my-4 max-w-sm">
        <Input label="Email" placeholder="you@example.com" />
      </div>
      <pre><code>{`<Input label="Email" placeholder="you@example.com" />`}</code></pre>

      <h2>With Helper Text</h2>
      <div className="not-prose my-4 max-w-sm">
        <Input label="Password" type="password" placeholder="Enter password" helperText="Must be at least 8 characters" />
      </div>
      <pre><code>{`<Input
  label="Password"
  type="password"
  placeholder="Enter password"
  helperText="Must be at least 8 characters"
/>`}</code></pre>

      <h2>Error State</h2>
      <div className="not-prose my-4 max-w-sm">
        <Input label="Email" placeholder="you@example.com" error="Please enter a valid email address" />
      </div>
      <pre><code>{`<Input
  label="Email"
  placeholder="you@example.com"
  error="Please enter a valid email address"
/>`}</code></pre>

      <h2>Input Types</h2>
      <div className="not-prose my-4 max-w-sm space-y-3">
        <Input label="Text" placeholder="Text input" />
        <Input label="Email" type="email" placeholder="Email input" />
        <Input label="Password" type="password" placeholder="Password input" />
        <Input label="Number" type="number" placeholder="0" />
      </div>

      <h2>Props</h2>
      <div className="not-prose">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="text-left py-2 font-semibold text-neutral-700">Prop</th>
              <th className="text-left py-2 font-semibold text-neutral-700">Type</th>
              <th className="text-left py-2 font-semibold text-neutral-700">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">label</td>
              <td className="py-2 text-xs text-neutral-500">string</td>
              <td className="py-2 text-xs text-neutral-500">Label displayed above input</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">error</td>
              <td className="py-2 text-xs text-neutral-500">string</td>
              <td className="py-2 text-xs text-neutral-500">Error message below input</td>
            </tr>
            <tr>
              <td className="py-2 font-mono text-xs text-brand-600">helperText</td>
              <td className="py-2 text-xs text-neutral-500">string</td>
              <td className="py-2 text-xs text-neutral-500">Helper text (hidden when error is shown)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
