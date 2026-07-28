import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";

export default function BreadcrumbDoc() {
  return (
    <div>
      <nav className="text-sm text-neutral-400 mb-6">
        <Link href="/docs/components" className="hover:text-brand-600">
          Components
        </Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-700">Breadcrumb</span>
      </nav>

      <h1>Breadcrumb</h1>
      <p>
        Navigation breadcrumbs that show the current page location within a
        hierarchy.
      </p>

      <h2>Import</h2>
      <pre><code>{`import { Breadcrumb } from 'mksystems';`}</code></pre>

      <h2>Example</h2>
      <div className="not-prose my-4">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Components", href: "/docs/components" },
            { label: "Breadcrumb" },
          ]}
        />
      </div>
      <pre><code>{`<Breadcrumb
  items={[
    { label: "Home", href: "/" },
    { label: "Components", href: "/docs/components" },
    { label: "Breadcrumb" },
  ]}
/>`}</code></pre>

      <h2>With Links</h2>
      <div className="not-prose my-4">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Settings", href: "/dashboard/settings" },
            { label: "Profile" },
          ]}
        />
      </div>
      <pre><code>{`<Breadcrumb
  separator="/"
  items={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Settings", href: "/dashboard/settings" },
    { label: "Profile" },
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
              <td className="py-2 text-xs text-neutral-500">{"{ label: string; href?: string }[]"}</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
              <td className="py-2 text-xs text-neutral-500">Array of breadcrumb items</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">separator</td>
              <td className="py-2 text-xs text-neutral-500">ReactNode</td>
              <td className="py-2 text-xs text-neutral-500">"/"</td>
              <td className="py-2 text-xs text-neutral-500">Separator between items</td>
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
