"use client";

import Link from "next/link";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useState } from "react";

export default function ModalDoc() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <nav className="text-sm text-neutral-400 mb-6">
        <Link href="/docs/components" className="hover:text-brand-600">Components</Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-700">Modal</span>
      </nav>

      <h1>Modal</h1>
      <p>Dialog overlay with keyboard and focus management.</p>

      <h2>Import</h2>
      <pre><code>{`import { Modal } from 'mksystems';`}</code></pre>

      <h2>Example</h2>
      <div className="not-prose my-4">
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <Modal open={open} onClose={() => setOpen(false)} title="Example Modal">
          <p className="text-sm text-neutral-600 mb-4">
            This is a modal dialog. Press Escape or click the overlay to close.
          </p>
          <div className="space-y-3">
            <Input label="Name" placeholder="Your name" />
            <Input label="Email" placeholder="you@example.com" />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setOpen(false)}>Save</Button>
          </div>
        </Modal>
      </div>
      <pre><code>{`"use client";
import { useState } from 'react';
import { Modal, Button, Input } from 'mksystems';

function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Example Modal">
        <p>This is a modal dialog.</p>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setOpen(false)}>
            Save
          </Button>
        </div>
      </Modal>
    </>
  );
}`}</code></pre>

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
              <td className="py-2 font-mono text-xs text-brand-600">onClose</td>
              <td className="py-2 text-xs text-neutral-500">() =&gt; void</td>
              <td className="py-2 text-xs text-neutral-500">— (required)</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">title</td>
              <td className="py-2 text-xs text-neutral-500">string</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
            </tr>
            <tr>
              <td className="py-2 font-mono text-xs text-brand-600">size</td>
              <td className="py-2 text-xs text-neutral-500">"sm" | "md" | "lg"</td>
              <td className="py-2 text-xs text-neutral-500">"md"</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
