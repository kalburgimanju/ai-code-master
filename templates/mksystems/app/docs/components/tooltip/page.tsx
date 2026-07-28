"use client";

import Link from "next/link";
import Tooltip from "@/components/Tooltip";
import Button from "@/components/Button";

export default function TooltipDoc() {
  return (
    <div>
      <nav className="text-sm text-neutral-400 mb-6">
        <Link href="/docs/components" className="hover:text-brand-600">Components</Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-700">Tooltip</span>
      </nav>

      <h1>Tooltip</h1>
      <p>Hover tooltip with position control.</p>

      <h2>Import</h2>
      <pre><code>{`import { Tooltip } from 'mksystems';`}</code></pre>

      <h2>Positions</h2>
      <div className="flex items-center gap-6 not-prose my-4">
        <Tooltip content="Top tooltip" position="top">
          <Button variant="outline" size="sm">Top</Button>
        </Tooltip>
        <Tooltip content="Bottom tooltip" position="bottom">
          <Button variant="outline" size="sm">Bottom</Button>
        </Tooltip>
        <Tooltip content="Left tooltip" position="left">
          <Button variant="outline" size="sm">Left</Button>
        </Tooltip>
        <Tooltip content="Right tooltip" position="right">
          <Button variant="outline" size="sm">Right</Button>
        </Tooltip>
      </div>

      <pre><code>{`<Tooltip content="Top tooltip" position="top">
  <Button>Hover me</Button>
</Tooltip>

<Tooltip content="Right tooltip" position="right">
  <Button>Hover me</Button>
</Tooltip>`}</code></pre>

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
              <td className="py-2 font-mono text-xs text-brand-600">content</td>
              <td className="py-2 text-xs text-neutral-500">ReactNode</td>
              <td className="py-2 text-xs text-neutral-500">— (required)</td>
            </tr>
            <tr>
              <td className="py-2 font-mono text-xs text-brand-600">position</td>
              <td className="py-2 text-xs text-neutral-500">"top" | "bottom" | "left" | "right"</td>
              <td className="py-2 text-xs text-neutral-500">"top"</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
