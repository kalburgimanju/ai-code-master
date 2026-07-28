"use client";

import Link from "next/link";
import Radio from "@/components/Radio";
import { RadioGroup } from "@/components/Radio";

export default function RadioDoc() {
  return (
    <div>
      <nav className="text-sm text-neutral-400 mb-6">
        <Link href="/docs/components" className="hover:text-brand-600">
          Components
        </Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-700">Radio</span>
      </nav>

      <h1>Radio</h1>
      <p>
        Radio buttons for selecting a single option from a set. Can be used
        individually or wrapped in a RadioGroup.
      </p>

      <h2>Import</h2>
      <pre><code>{`import { Radio, RadioGroup } from 'mksystems';`}</code></pre>

      <h2>Individual Radio</h2>
      <div className="not-prose my-4 flex flex-col gap-2">
        <Radio name="plan" value="free" label="Free" />
        <Radio name="plan" value="pro" label="Pro" />
        <Radio name="plan" value="enterprise" label="Enterprise" />
      </div>
      <pre><code>{`<Radio name="plan" value="free" label="Free" />
<Radio name="plan" value="pro" label="Pro" />
<Radio name="plan" value="enterprise" label="Enterprise" />`}</code></pre>

      <h2>RadioGroup</h2>
      <div className="not-prose my-4">
        <RadioGroup
          name="subscription"
          value="pro"
          options={[
            { value: "free", label: "Free — $0/mo" },
            { value: "pro", label: "Pro — $19/mo" },
            { value: "enterprise", label: "Enterprise — $99/mo" },
          ]}
        />
      </div>
      <pre><code>{`<RadioGroup
  name="subscription"
  defaultValue="pro"
  options={[
    { value: "free", label: "Free — $0/mo" },
    { value: "pro", label: "Pro — $19/mo" },
    { value: "enterprise", label: "Enterprise — $99/mo" },
  ]}
/>`}</code></pre>

      <h2>Disabled State</h2>
      <div className="not-prose my-4 flex flex-col gap-2">
        <Radio name="status" value="active" label="Active" />
        <Radio name="status" value="inactive" label="Inactive" disabled />
      </div>
      <pre><code>{`<Radio name="status" value="active" label="Active" />
<Radio name="status" value="inactive" label="Inactive" disabled />`}</code></pre>

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
              <td className="py-2 font-mono text-xs text-brand-600">name</td>
              <td className="py-2 text-xs text-neutral-500">string</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
              <td className="py-2 text-xs text-neutral-500">Radio group name attribute</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">value</td>
              <td className="py-2 text-xs text-neutral-500">string</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
              <td className="py-2 text-xs text-neutral-500">Value of the radio option</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">label</td>
              <td className="py-2 text-xs text-neutral-500">string</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
              <td className="py-2 text-xs text-neutral-500">Label text</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">disabled</td>
              <td className="py-2 text-xs text-neutral-500">boolean</td>
              <td className="py-2 text-xs text-neutral-500">false</td>
              <td className="py-2 text-xs text-neutral-500">Disable interaction</td>
            </tr>
            <tr>
              <td className="py-2 font-mono text-xs text-brand-600">onChange</td>
              <td className="py-2 text-xs text-neutral-500">(value: string) =&gt; void</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
              <td className="py-2 text-xs text-neutral-500">Callback when selection changes</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
