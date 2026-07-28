"use client";

import Link from "next/link";
import Toast from "@/components/Toast";
import Button from "@/components/Button";
import { useState } from "react";

export default function ToastDoc() {
  const [toast, setToast] = useState<{
    open: boolean;
    variant: "success" | "error" | "warning" | "info";
    message: string;
  }>({ open: false, variant: "info", message: "" });

  const show = (variant: "success" | "error" | "warning" | "info", message: string) => {
    setToast({ open: true, variant, message });
  };

  return (
    <div>
      <nav className="text-sm text-neutral-400 mb-6">
        <Link href="/docs/components" className="hover:text-brand-600">Components</Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-700">Toast</span>
      </nav>

      <h1>Toast</h1>
      <p>Temporary notification with auto-dismiss.</p>

      <h2>Import</h2>
      <pre><code>{`import { Toast } from 'mksystems';`}</code></pre>

      <h2>Variants</h2>
      <div className="flex flex-wrap gap-3 not-prose my-4">
        <Button size="sm" onClick={() => show("success", "Changes saved successfully!")}>Success</Button>
        <Button size="sm" variant="danger" onClick={() => show("error", "Something went wrong.")}>Error</Button>
        <Button size="sm" variant="secondary" onClick={() => show("warning", "Your trial expires soon.")}>Warning</Button>
        <Button size="sm" variant="outline" onClick={() => show("info", "New version available.")}>Info</Button>
      </div>

      <Toast
        open={toast.open}
        variant={toast.variant}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />

      <pre><code>{`const [open, setOpen] = useState(false);
const [variant, setVariant] = useState("info");

<Toast
  open={open}
  variant={variant}
  message="Changes saved!"
  onClose={() => setOpen(false)}
  duration={4000}
/>`}</code></pre>

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
              <td className="py-2 font-mono text-xs text-brand-600">open</td>
              <td className="py-2 text-xs text-neutral-500">boolean</td>
              <td className="py-2 text-xs text-neutral-500">— (required)</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">variant</td>
              <td className="py-2 text-xs text-neutral-500">"success" | "error" | "warning" | "info"</td>
              <td className="py-2 text-xs text-neutral-500">"info"</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">message</td>
              <td className="py-2 text-xs text-neutral-500">string</td>
              <td className="py-2 text-xs text-neutral-500">— (required)</td>
            </tr>
            <tr>
              <td className="py-2 font-mono text-xs text-brand-600">duration</td>
              <td className="py-2 text-xs text-neutral-500">number</td>
              <td className="py-2 text-xs text-neutral-500">4000</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
