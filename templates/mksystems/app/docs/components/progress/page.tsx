import Link from "next/link";
import Progress from "@/components/Progress";

export default function ProgressDoc() {
  return (
    <div>
      <nav className="text-sm text-neutral-400 mb-6">
        <Link href="/docs/components" className="hover:text-brand-600">Components</Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-700">Progress</span>
      </nav>

      <h1>Progress</h1>
      <p>Progress bar with labels and color variants.</p>

      <h2>Import</h2>
      <pre><code>{`import { Progress } from 'mksystems';`}</code></pre>

      <h2>With Labels</h2>
      <div className="not-prose my-4 space-y-4 max-w-md">
        <Progress value={75} showLabel label="Upload Progress" />
        <Progress value={45} variant="success" showLabel label="Completed" />
        <Progress value={90} variant="warning" showLabel label="Almost full" />
        <Progress value={20} variant="error" showLabel label="Low stock" />
      </div>

      <h2>Sizes</h2>
      <div className="not-prose my-4 space-y-4 max-w-md">
        <Progress value={60} size="sm" />
        <Progress value={60} size="md" />
        <Progress value={60} size="lg" />
      </div>

      <pre><code>{`<Progress value={75} showLabel label="Upload" />
<Progress value={45} variant="success" />
<Progress value={60} size="lg" />`}</code></pre>

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
              <td className="py-2 font-mono text-xs text-brand-600">value</td>
              <td className="py-2 text-xs text-neutral-500">number (0-100)</td>
              <td className="py-2 text-xs text-neutral-500">— (required)</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">variant</td>
              <td className="py-2 text-xs text-neutral-500">"brand" | "success" | "warning" | "error"</td>
              <td className="py-2 text-xs text-neutral-500">"brand"</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">size</td>
              <td className="py-2 text-xs text-neutral-500">"sm" | "md" | "lg"</td>
              <td className="py-2 text-xs text-neutral-500">"md"</td>
            </tr>
            <tr>
              <td className="py-2 font-mono text-xs text-brand-600">showLabel</td>
              <td className="py-2 text-xs text-neutral-500">boolean</td>
              <td className="py-2 text-xs text-neutral-500">false</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
