"use client";

import Link from "next/link";
import Accordion from "@/components/Accordion";

export default function AccordionDoc() {
  return (
    <div>
      <nav className="text-sm text-neutral-400 mb-6">
        <Link href="/docs/components" className="hover:text-brand-600">
          Components
        </Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-700">Accordion</span>
      </nav>

      <h1>Accordion</h1>
      <p>
        Collapsible sections that expand and contract to show or hide content.
        Supports single and multiple open items.
      </p>

      <h2>Import</h2>
      <pre><code>{`import { Accordion } from 'mksystems';`}</code></pre>

      <h2>Example</h2>
      <div className="not-prose my-4">
        <Accordion
          items={[
            {
              id: "1",
              header: "What is MKSystems?",
              children:
                "MKSystems is a modern design system and component library for building consistent, accessible user interfaces.",
            },
            {
              id: "2",
              header: "How do I get started?",
              children:
                "Install the package via npm or yarn, then import the components you need into your project.",
            },
            {
              id: "3",
              header: "Is it accessible?",
              children:
                "Yes. All components follow WAI-ARIA patterns and are keyboard navigable.",
            },
          ]}
        />
      </div>
      <pre><code>{`<Accordion
  items={[
    {
      id: "1",
      header: "What is MKSystems?",
      children: "MKSystems is a modern design system...",
    },
    {
      id: "2",
      header: "How do I get started?",
      children: "Install the package via npm or yarn...",
    },
    {
      id: "3",
      header: "Is it accessible?",
      children: "Yes. All components follow WAI-ARIA patterns...",
    },
  ]}
/>`}</code></pre>

      <h2>Multiple Mode</h2>
      <p>
        Allow multiple items to be open at the same time using the{" "}
        <code>multiple</code> prop.
      </p>
      <div className="not-prose my-4">
        <Accordion
          multiple
          items={[
            {
              id: "a",
              header: "Section One",
              children: "You can open this and other sections simultaneously.",
            },
            {
              id: "b",
              header: "Section Two",
              children: "Multiple sections can be expanded at once.",
            },
            {
              id: "c",
              header: "Section Three",
              children: "Close each section individually.",
            },
          ]}
        />
      </div>
      <pre><code>{`<Accordion
  multiple
  items={[
    { id: "a", header: "Section One", children: "..." },
    { id: "b", header: "Section Two", children: "..." },
    { id: "c", header: "Section Three", children: "..." },
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
              <th className="text-left py-2 font-semibold text-neutral-700">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">items</td>
              <td className="py-2 text-xs text-neutral-500">AccordionItem[]</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
              <td className="py-2 text-xs text-neutral-500">Array of accordion items with id, title, and content</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">multiple</td>
              <td className="py-2 text-xs text-neutral-500">boolean</td>
              <td className="py-2 text-xs text-neutral-500">false</td>
              <td className="py-2 text-xs text-neutral-500">Allow multiple items open at once</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">defaultOpen</td>
              <td className="py-2 text-xs text-neutral-500">string[]</td>
              <td className="py-2 text-xs text-neutral-500">[]</td>
              <td className="py-2 text-xs text-neutral-500">IDs of initially open items</td>
            </tr>
            <tr>
              <td className="py-2 font-mono text-xs text-brand-600">className</td>
              <td className="py-2 text-xs text-neutral-500">string</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
              <td className="py-2 text-xs text-neutral-500">Additional CSS classes</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
