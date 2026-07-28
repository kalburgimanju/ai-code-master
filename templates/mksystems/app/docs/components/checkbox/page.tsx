"use client";

import Link from "next/link";
import Checkbox from "@/components/Checkbox";

export default function CheckboxDoc() {
  return (
    <div>
      <nav className="text-sm text-neutral-400 mb-6">
        <Link href="/docs/components" className="hover:text-brand-600">
          Components
        </Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-700">Checkbox</span>
      </nav>

      <h1>Checkbox</h1>
      <p>
        Form checkboxes with label, checked state, and error support. Fully
        accessible with keyboard navigation.
      </p>

      <h2>Import</h2>
      <pre><code>{`import { Checkbox } from 'mksystems';`}</code></pre>

      <h2>Single Checkbox</h2>
      <div className="not-prose my-4">
        <Checkbox label="I agree to the terms and conditions" />
      </div>
      <pre><code>{`<Checkbox label="I agree to the terms and conditions" />`}</code></pre>

      <h2>Checked by Default</h2>
      <div className="not-prose my-4">
        <Checkbox label="Enable notifications" defaultChecked />
      </div>
      <pre><code>{`<Checkbox label="Enable notifications" defaultChecked />`}</code></pre>

      <h2>Error State</h2>
      <div className="not-prose my-4">
        <Checkbox label="You must agree to continue" error="Please accept the terms" />
      </div>
      <pre><code>{`<Checkbox
  label="You must agree to continue"
  error="Please accept the terms"
/>`}</code></pre>

      <h2>Disabled</h2>
      <div className="not-prose my-4">
        <Checkbox label="This option is unavailable" disabled />
      </div>
      <pre><code>{`<Checkbox label="This option is unavailable" disabled />`}</code></pre>

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
              <td className="py-2 font-mono text-xs text-brand-600">label</td>
              <td className="py-2 text-xs text-neutral-500">string</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
              <td className="py-2 text-xs text-neutral-500">Label text for the checkbox</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">defaultChecked</td>
              <td className="py-2 text-xs text-neutral-500">boolean</td>
              <td className="py-2 text-xs text-neutral-500">false</td>
              <td className="py-2 text-xs text-neutral-500">Initial checked state</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">error</td>
              <td className="py-2 text-xs text-neutral-500">string</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
              <td className="py-2 text-xs text-neutral-500">Error message to display</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">disabled</td>
              <td className="py-2 text-xs text-neutral-500">boolean</td>
              <td className="py-2 text-xs text-neutral-500">false</td>
              <td className="py-2 text-xs text-neutral-500">Disable interaction</td>
            </tr>
            <tr>
              <td className="py-2 font-mono text-xs text-brand-600">onChange</td>
              <td className="py-2 text-xs text-neutral-500">(checked: boolean) =&gt; void</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
              <td className="py-2 text-xs text-neutral-500">Callback when state changes</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
