"use client";

import { useState } from "react";
import Link from "next/link";
import Drawer from "@/components/Drawer";

export default function DrawerDoc() {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  return (
    <div>
      <nav className="text-sm text-neutral-400 mb-6">
        <Link href="/docs/components" className="hover:text-brand-600">
          Components
        </Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-700">Drawer</span>
      </nav>

      <h1>Drawer</h1>
      <p>
        Slide-in drawer panel for overlays, navigation, or detail views. Opens
        from the left or right side.
      </p>

      <h2>Import</h2>
      <pre><code>{`import { Drawer } from 'mksystems';`}</code></pre>

      <h2>Left Drawer</h2>
      <div className="not-prose my-4">
        <button
          onClick={() => setLeftOpen(true)}
          className="px-4 py-2 bg-brand-600 text-white rounded-md text-sm"
        >
          Open Left Drawer
        </button>
      </div>

      <Drawer
        open={leftOpen}
        onClose={() => setLeftOpen(false)}
        position="left"
        title="Navigation"
      >
        <div className="p-4 space-y-3">
          <p className="text-neutral-600">
            This is a left-side drawer with navigation content.
          </p>
          <nav className="flex flex-col gap-2">
            <a href="#" className="text-brand-600 hover:underline">Dashboard</a>
            <a href="#" className="text-brand-600 hover:underline">Settings</a>
            <a href="#" className="text-brand-600 hover:underline">Profile</a>
          </nav>
        </div>
      </Drawer>

      <pre><code>{`const [open, setOpen] = useState(false);

<button onClick={() => setOpen(true)}>Open Left Drawer</button>

<Drawer open={open} onClose={() => setOpen(false)} position="left" title="Navigation">
  <div className="p-4">
    <p>Drawer content...</p>
  </div>
</Drawer>`}</code></pre>

      <h2>Right Drawer</h2>
      <div className="not-prose my-4">
        <button
          onClick={() => setRightOpen(true)}
          className="px-4 py-2 bg-neutral-700 text-white rounded-md text-sm"
        >
          Open Right Drawer
        </button>
      </div>

      <Drawer
        open={rightOpen}
        onClose={() => setRightOpen(false)}
        position="right"
        title="Details"
      >
        <div className="p-4">
          <p className="text-neutral-600">
            This is a right-side drawer for detail views or settings panels.
          </p>
        </div>
      </Drawer>

      <pre><code>{`<Drawer open={open} onClose={() => setOpen(false)} position="right" title="Details">
  <div className="p-4">
    <p>Details content...</p>
  </div>
</Drawer>`}</code></pre>

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
              <td className="py-2 font-mono text-xs text-brand-600">open</td>
              <td className="py-2 text-xs text-neutral-500">boolean</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
              <td className="py-2 text-xs text-neutral-500">Whether the drawer is visible</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">onClose</td>
              <td className="py-2 text-xs text-neutral-500">() =&gt; void</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
              <td className="py-2 text-xs text-neutral-500">Callback to close the drawer</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">side</td>
              <td className="py-2 text-xs text-neutral-500">"left" | "right"</td>
              <td className="py-2 text-xs text-neutral-500">"right"</td>
              <td className="py-2 text-xs text-neutral-500">Which side to slide in from</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">title</td>
              <td className="py-2 text-xs text-neutral-500">string</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
              <td className="py-2 text-xs text-neutral-500">Drawer header title</td>
            </tr>
            <tr>
              <td className="py-2 font-mono text-xs text-brand-600">children</td>
              <td className="py-2 text-xs text-neutral-500">ReactNode</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
              <td className="py-2 text-xs text-neutral-500">Drawer body content</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
