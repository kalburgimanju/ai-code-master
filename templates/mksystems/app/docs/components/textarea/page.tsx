import Link from "next/link";
import Textarea from "@/components/Textarea";

export default function TextareaDoc() {
  return (
    <div>
      <nav className="text-sm text-neutral-400 mb-6">
        <Link href="/docs/components" className="hover:text-brand-600">
          Components
        </Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-700">Textarea</span>
      </nav>

      <h1>Textarea</h1>
      <p>
        Multi-line text input with label, helper text, and error state support.
      </p>

      <h2>Import</h2>
      <pre><code>{`import { Textarea } from 'mksystems';`}</code></pre>

      <h2>Basic Example</h2>
      <div className="not-prose my-4 max-w-md">
        <Textarea label="Bio" placeholder="Tell us about yourself..." />
      </div>
      <pre><code>{`<Textarea label="Bio" placeholder="Tell us about yourself..." />`}</code></pre>

      <h2>With Helper Text</h2>
      <div className="not-prose my-4 max-w-md">
        <Textarea
          label="Description"
          placeholder="Describe the project..."
          helperText="Maximum 500 characters"
        />
      </div>
      <pre><code>{`<Textarea
  label="Description"
  placeholder="Describe the project..."
  helperText="Maximum 500 characters"
/>`}</code></pre>

      <h2>Error State</h2>
      <div className="not-prose my-4 max-w-md">
        <Textarea
          label="Feedback"
          placeholder="Share your feedback..."
          error="This field is required"
        />
      </div>
      <pre><code>{`<Textarea
  label="Feedback"
  placeholder="Share your feedback..."
  error="This field is required"
/>`}</code></pre>

      <h2>Disabled</h2>
      <div className="not-prose my-4 max-w-md">
        <Textarea label="Notes" value="This field is read-only." disabled />
      </div>
      <pre><code>{`<Textarea label="Notes" value="This field is read-only." disabled />`}</code></pre>

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
              <td className="py-2 font-mono text-xs text-brand-600">value</td>
              <td className="py-2 text-xs text-neutral-500">string</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
              <td className="py-2 text-xs text-neutral-500">Controlled value</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">helperText</td>
              <td className="py-2 text-xs text-neutral-500">string</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
              <td className="py-2 text-xs text-neutral-500">Helper text below the input</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">error</td>
              <td className="py-2 text-xs text-neutral-500">string</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
              <td className="py-2 text-xs text-neutral-500">Error message</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">rows</td>
              <td className="py-2 text-xs text-neutral-500">number</td>
              <td className="py-2 text-xs text-neutral-500">4</td>
              <td className="py-2 text-xs text-neutral-500">Number of visible rows</td>
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
