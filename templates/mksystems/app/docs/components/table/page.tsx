import Link from "next/link";
import Table from "@/components/Table";

const columns = [
  { key: "name", header: "Name" },
  { key: "role", header: "Role" },
  { key: "status", header: "Status" },
];

const data = [
  { name: "Alice Johnson", role: "Engineer", status: "Active" },
  { name: "Bob Smith", role: "Designer", status: "Active" },
  { name: "Carol White", role: "PM", status: "Away" },
  { name: "Dave Brown", role: "Engineer", status: "Offline" },
];

export default function TableDoc() {
  return (
    <div>
      <nav className="text-sm text-neutral-400 mb-6">
        <Link href="/docs/components" className="hover:text-brand-600">Components</Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-700">Table</span>
      </nav>

      <h1>Table</h1>
      <p>Data table with columns, striped rows, and hover effects.</p>

      <h2>Import</h2>
      <pre><code>{`import { Table } from 'mksystems';`}</code></pre>

      <h2>Example</h2>
      <div className="not-prose my-4">
        <Table columns={columns} data={data} striped hoverable />
      </div>

      <h2>Empty State</h2>
      <div className="not-prose my-4">
        <Table columns={columns} data={[]} emptyMessage="No users found" />
      </div>

      <pre><code>{`const columns = [
  { key: "name", header: "Name" },
  { key: "role", header: "Role" },
];

const data = [
  { name: "Alice", role: "Engineer" },
  { name: "Bob", role: "Designer" },
];

<Table columns={columns} data={data} striped />`}</code></pre>

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
              <td className="py-2 font-mono text-xs text-brand-600">columns</td>
              <td className="py-2 text-xs text-neutral-500">TableColumn[]</td>
              <td className="py-2 text-xs text-neutral-500">— (required)</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">data</td>
              <td className="py-2 text-xs text-neutral-500">Record[]</td>
              <td className="py-2 text-xs text-neutral-500">— (required)</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">striped</td>
              <td className="py-2 text-xs text-neutral-500">boolean</td>
              <td className="py-2 text-xs text-neutral-500">false</td>
            </tr>
            <tr>
              <td className="py-2 font-mono text-xs text-brand-600">hoverable</td>
              <td className="py-2 text-xs text-neutral-500">boolean</td>
              <td className="py-2 text-xs text-neutral-500">true</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
