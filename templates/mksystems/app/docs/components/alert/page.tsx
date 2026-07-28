"use client";

import Link from "next/link";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import { useState } from "react";

export default function AlertDoc() {
  const [showDemo, setShowDemo] = useState(true);

  return (
    <div>
      <nav className="text-sm text-neutral-400 mb-6">
        <Link href="/docs/components" className="hover:text-brand-600">Components</Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-700">Alert</span>
      </nav>

      <h1>Alert</h1>
      <p>Inline notification with dismissible support.</p>

      <h2>Import</h2>
      <pre><code>{`import { Alert } from 'mksystems';`}</code></pre>

      <h2>Variants</h2>
      <div className="space-y-3 not-prose my-4">
        <Alert variant="info" title="Information">This is an informational message.</Alert>
        <Alert variant="success" title="Success">Your changes have been saved successfully.</Alert>
        <Alert variant="warning" title="Warning">Your account is approaching the storage limit.</Alert>
        <Alert variant="error" title="Error">Something went wrong. Please try again.</Alert>
      </div>
      <pre><code>{`<Alert variant="info" title="Information">
  This is an informational message.
</Alert>
<Alert variant="success" title="Success">
  Your changes have been saved successfully.
</Alert>
<Alert variant="warning" title="Warning">
  Your account is approaching the storage limit.
</Alert>
<Alert variant="error" title="Error">
  Something went wrong. Please try again.
</Alert>`}</code></pre>

      <h2>Dismissible</h2>
      <div className="not-prose my-4">
        {showDemo ? (
          <Alert variant="info" title="Dismissible" dismissible onClose={() => setShowDemo(false)}>
            Click the X to dismiss this alert.
          </Alert>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setShowDemo(true)}>
            Show alert again
          </Button>
        )}
      </div>
      <pre><code>{`<Alert variant="info" title="Dismissible" dismissible>
  Click the X to dismiss this alert.
</Alert>`}</code></pre>

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
              <td className="py-2 text-xs text-neutral-500">"success" | "warning" | "error" | "info"</td>
              <td className="py-2 text-xs text-neutral-500">"info"</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">title</td>
              <td className="py-2 text-xs text-neutral-500">string</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
            </tr>
            <tr>
              <td className="py-2 font-mono text-xs text-brand-600">dismissible</td>
              <td className="py-2 text-xs text-neutral-500">boolean</td>
              <td className="py-2 text-xs text-neutral-500">false</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
