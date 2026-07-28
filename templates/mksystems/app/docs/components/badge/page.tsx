import Link from "next/link";
import Badge from "@/components/Badge";

export default function BadgeDoc() {
  return (
    <div>
      <nav className="text-sm text-neutral-400 mb-6">
        <Link href="/docs/components" className="hover:text-brand-600">Components</Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-700">Badge</span>
      </nav>

      <h1>Badge</h1>
      <p>Status indicator for labels, tags, and notifications.</p>

      <h2>Import</h2>
      <pre><code>{`import { Badge } from 'mksystems';`}</code></pre>

      <h2>Variants</h2>
      <div className="flex flex-wrap gap-3 not-prose my-4">
        <Badge variant="default">Default</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="error">Error</Badge>
        <Badge variant="info">Info</Badge>
      </div>
      <pre><code>{`<Badge variant="default">Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="info">Info</Badge>`}</code></pre>

      <h2>Sizes</h2>
      <div className="flex items-center gap-3 not-prose my-4">
        <Badge variant="info" size="sm">Small</Badge>
        <Badge variant="info" size="md">Medium</Badge>
      </div>
      <pre><code>{`<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>`}</code></pre>

      <h2>Use Cases</h2>
      <div className="not-prose my-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-700">Order status:</span>
          <Badge variant="success">Delivered</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-700">Server health:</span>
          <Badge variant="warning">Degraded</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-700">Build:</span>
          <Badge variant="error">Failed</Badge>
        </div>
      </div>

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
              <td className="py-2 text-xs text-neutral-500">"default" | "success" | "warning" | "error" | "info"</td>
              <td className="py-2 text-xs text-neutral-500">"default"</td>
            </tr>
            <tr>
              <td className="py-2 font-mono text-xs text-brand-600">size</td>
              <td className="py-2 text-xs text-neutral-500">"sm" | "md"</td>
              <td className="py-2 text-xs text-neutral-500">"md"</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
