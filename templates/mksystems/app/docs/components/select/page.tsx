import Link from "next/link";
import Select from "@/components/Select";

export default function SelectDoc() {
  return (
    <div>
      <nav className="text-sm text-neutral-400 mb-6">
        <Link href="/docs/components" className="hover:text-brand-600">
          Components
        </Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-700">Select</span>
      </nav>

      <h1>Select</h1>
      <p>
        Dropdown select for choosing a single option from a list. Supports
        placeholder, error states, and disabled options.
      </p>

      <h2>Import</h2>
      <pre><code>{`import { Select } from 'mksystems';`}</code></pre>

      <h2>Basic Example</h2>
      <div className="not-prose my-4 max-w-xs">
        <Select
          label="Country"
          placeholder="Select a country"
          options={[
            { value: "us", label: "United States" },
            { value: "uk", label: "United Kingdom" },
            { value: "ca", label: "Canada" },
            { value: "au", label: "Australia" },
          ]}
        />
      </div>
      <pre><code>{`<Select
  label="Country"
  placeholder="Select a country"
  options={[
    { value: "us", label: "United States" },
    { value: "uk", label: "United Kingdom" },
    { value: "ca", label: "Canada" },
    { value: "au", label: "Australia" },
  ]}
/>`}</code></pre>

      <h2>With Error</h2>
      <div className="not-prose my-4 max-w-xs">
        <Select
          label="Role"
          placeholder="Select a role"
          error="Please select a role"
          options={[
            { value: "admin", label: "Admin" },
            { value: "editor", label: "Editor" },
            { value: "viewer", label: "Viewer" },
          ]}
        />
      </div>
      <pre><code>{`<Select
  label="Role"
  placeholder="Select a role"
  error="Please select a role"
  options={[
    { value: "admin", label: "Admin" },
    { value: "editor", label: "Editor" },
    { value: "viewer", label: "Viewer" },
  ]}
/>`}</code></pre>

      <h2>Disabled</h2>
      <div className="not-prose my-4 max-w-xs">
        <Select
          label="Plan"
          disabled
          options={[
            { value: "free", label: "Free" },
            { value: "pro", label: "Pro" },
          ]}
        />
      </div>
      <pre><code>{`<Select label="Plan" disabled options={[...]} />`}</code></pre>

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
              <td className="py-2 text-xs text-neutral-500">Label text</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">placeholder</td>
              <td className="py-2 text-xs text-neutral-500">string</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
              <td className="py-2 text-xs text-neutral-500">Placeholder text</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">options</td>
              <td className="py-2 text-xs text-neutral-500">{"{ value: string; label: string }[]"}</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
              <td className="py-2 text-xs text-neutral-500">Available options</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">error</td>
              <td className="py-2 text-xs text-neutral-500">string</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
              <td className="py-2 text-xs text-neutral-500">Error message</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">disabled</td>
              <td className="py-2 text-xs text-neutral-500">boolean</td>
              <td className="py-2 text-xs text-neutral-500">false</td>
              <td className="py-2 text-xs text-neutral-500">Disable interaction</td>
            </tr>
            <tr>
              <td className="py-2 font-mono text-xs text-brand-600">value</td>
              <td className="py-2 text-xs text-neutral-500">string</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
              <td className="py-2 text-xs text-neutral-500">Controlled selected value</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
