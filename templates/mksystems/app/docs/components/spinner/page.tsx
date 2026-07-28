import Link from "next/link";
import Spinner from "@/components/Spinner";

export default function SpinnerDoc() {
  return (
    <div>
      <nav className="text-sm text-neutral-400 mb-6">
        <Link href="/docs/components" className="hover:text-brand-600">
          Components
        </Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-700">Spinner</span>
      </nav>

      <h1>Spinner</h1>
      <p>Loading spinner for indicating async operations or content loading.</p>

      <h2>Import</h2>
      <pre><code>{`import { Spinner } from 'mksystems';`}</code></pre>

      <h2>Sizes</h2>
      <div className="flex items-center gap-6 not-prose my-4">
        <div className="flex flex-col items-center gap-1">
          <Spinner size="sm" />
          <span className="text-xs text-neutral-500">Small</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Spinner size="md" />
          <span className="text-xs text-neutral-500">Medium</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Spinner size="lg" />
          <span className="text-xs text-neutral-500">Large</span>
        </div>
      </div>
      <pre><code>{`<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />`}</code></pre>

      <h2>With Label</h2>
      <div className="flex items-center gap-3 not-prose my-4">
        <Spinner size="md" label="Loading data..." />
      </div>
      <pre><code>{`<Spinner size="md" label="Loading data..." />`}</code></pre>

      <h2>Inline Usage</h2>
      <div className="not-prose my-4">
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-md text-sm"
        >
          <Spinner size="sm" /> Saving...
        </button>
      </div>
      <pre><code>{`<button disabled className="flex items-center gap-2">
  <Spinner size="sm" /> Saving...
</button>`}</code></pre>

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
              <td className="py-2 font-mono text-xs text-brand-600">size</td>
              <td className="py-2 text-xs text-neutral-500">"sm" | "md" | "lg"</td>
              <td className="py-2 text-xs text-neutral-500">"md"</td>
              <td className="py-2 text-xs text-neutral-500">Size preset</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">label</td>
              <td className="py-2 text-xs text-neutral-500">string</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
              <td className="py-2 text-xs text-neutral-500">Accessible label text</td>
            </tr>
            <tr>
              <td className="py-2 font-mono text-xs text-brand-600">className</td>
              <td className="py-2 text-xs text-neutral-500">string</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
              <td className="py-2 text-xs text-neutral-500">Additional CSS classes</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
