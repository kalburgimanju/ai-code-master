"use client";

import Link from "next/link";
import DropdownMenu from "@/components/DropdownMenu";
import Button from "@/components/Button";
import { Settings, User, Trash2, Download } from "lucide-react";

export default function DropdownMenuDoc() {
  return (
    <div>
      <nav className="text-sm text-neutral-400 mb-6">
        <Link href="/docs/components" className="hover:text-brand-600">Components</Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-700">Dropdown Menu</span>
      </nav>

      <h1>Dropdown Menu</h1>
      <p>Action menu with icons and keyboard navigation.</p>

      <h2>Import</h2>
      <pre><code>{`import { DropdownMenu } from 'mksystems';`}</code></pre>

      <h2>Example</h2>
      <div className="flex gap-3 not-prose my-4">
        <DropdownMenu
          trigger={<Button variant="outline">Actions</Button>}
          items={[
            { label: "Profile", icon: <User className="w-4 h-4" />, onClick: () => {} },
            { label: "Settings", icon: <Settings className="w-4 h-4" />, onClick: () => {} },
            { label: "Download", icon: <Download className="w-4 h-4" />, onClick: () => {} },
            { label: "Delete", icon: <Trash2 className="w-4 h-4" />, danger: true, onClick: () => {} },
          ]}
        />
        <DropdownMenu
          trigger={<Button variant="outline">Right aligned</Button>}
          align="right"
          items={[
            { label: "Edit", onClick: () => {} },
            { label: "Duplicate", onClick: () => {} },
          ]}
        />
      </div>

      <pre><code>{`<DropdownMenu
  trigger={<Button>Actions</Button>}
  items={[
    { label: "Profile", icon: <User />, onClick: () => {} },
    { label: "Delete", icon: <Trash2 />, danger: true, onClick: () => {} },
  ]}
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
              <td className="py-2 font-mono text-xs text-brand-600">trigger</td>
              <td className="py-2 text-xs text-neutral-500">ReactNode</td>
              <td className="py-2 text-xs text-neutral-500">— (required)</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">items</td>
              <td className="py-2 text-xs text-neutral-500">DropdownMenuItem[]</td>
              <td className="py-2 text-xs text-neutral-500">— (required)</td>
            </tr>
            <tr>
              <td className="py-2 font-mono text-xs text-brand-600">align</td>
              <td className="py-2 text-xs text-neutral-500">"left" | "right"</td>
              <td className="py-2 text-xs text-neutral-500">"left"</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
