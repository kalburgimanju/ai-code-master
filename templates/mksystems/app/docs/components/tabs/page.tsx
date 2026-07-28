"use client";

import Link from "next/link";
import Tabs from "@/components/Tabs";

export default function TabsDoc() {
  return (
    <div>
      <nav className="text-sm text-neutral-400 mb-6">
        <Link href="/docs/components" className="hover:text-brand-600">Components</Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-700">Tabs</span>
      </nav>

      <h1>Tabs</h1>
      <p>Tabbed navigation with keyboard support.</p>

      <h2>Import</h2>
      <pre><code>{`import { Tabs } from 'mksystems';`}</code></pre>

      <h2>Example</h2>
      <div className="not-prose my-4">
        <Tabs items={[
          { id: "overview", label: "Overview", children: <p className="text-sm text-neutral-600">Overview content goes here. This is the default tab.</p> },
          { id: "features", label: "Features", children: <p className="text-sm text-neutral-600">Features content goes here. Click to switch tabs.</p> },
          { id: "pricing", label: "Pricing", children: <p className="text-sm text-neutral-600">Pricing content goes here. Supports keyboard navigation.</p> },
        ]} />
      </div>

      <pre><code>{`<Tabs items={[
  { id: "tab1", label: "Tab 1", children: <p>Content 1</p> },
  { id: "tab2", label: "Tab 2", children: <p>Content 2</p> },
  { id: "tab3", label: "Tab 3", children: <p>Content 3</p> },
]} />`}</code></pre>

      <h2>Controlled</h2>
      <pre><code>{`const [active, setActive] = useState("tab1");

<Tabs
  items={items}
  activeTab={active}
  onTabChange={setActive}
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
              <td className="py-2 font-mono text-xs text-brand-600">items</td>
              <td className="py-2 text-xs text-neutral-500">TabItem[]</td>
              <td className="py-2 text-xs text-neutral-500">— (required)</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">defaultTab</td>
              <td className="py-2 text-xs text-neutral-500">string</td>
              <td className="py-2 text-xs text-neutral-500">first tab id</td>
            </tr>
            <tr>
              <td className="py-2 font-mono text-xs text-brand-600">onTabChange</td>
              <td className="py-2 text-xs text-neutral-500">(id: string) =&gt; void</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
