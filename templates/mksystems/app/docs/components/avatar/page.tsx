import Link from "next/link";
import Avatar from "@/components/Avatar";
import { AvatarGroup } from "@/components/Avatar";

export default function AvatarDoc() {
  return (
    <div>
      <nav className="text-sm text-neutral-400 mb-6">
        <Link href="/docs/components" className="hover:text-brand-600">
          Components
        </Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-700">Avatar</span>
      </nav>

      <h1>Avatar</h1>
      <p>
        User avatars with image support, fallback initials, and grouped display.
      </p>

      <h2>Import</h2>
      <pre><code>{`import { Avatar, AvatarGroup } from 'mksystems';`}</code></pre>

      <h2>Sizes</h2>
      <div className="flex items-center gap-3 not-prose my-4">
        <Avatar size="xs" alt="XS User" />
        <Avatar size="sm" alt="Small User" />
        <Avatar size="md" alt="Medium User" />
        <Avatar size="lg" alt="Large User" />
        <Avatar size="xl" alt="XL User" />
      </div>
      <pre><code>{`<Avatar size="xs" alt="XS User" />
<Avatar size="sm" alt="Small User" />
<Avatar size="md" alt="Medium User" />
<Avatar size="lg" alt="Large User" />
<Avatar size="xl" alt="XL User" />`}</code></pre>

      <h2>Image vs Fallback</h2>
      <div className="flex items-center gap-3 not-prose my-4">
        <Avatar src="https://i.pravatar.cc/150?u=a1" alt="Alice Smith" />
        <Avatar alt="Bob Johnson" />
        <Avatar alt="" />
      </div>
      <pre><code>{`<Avatar src="https://i.pravatar.cc/150?u=a1" alt="Alice" alt="Alice Smith" />
<Avatar alt="Bob Johnson" />
<Avatar alt="" />`}</code></pre>

      <h2>Avatar Group</h2>
      <div className="not-prose my-4">
        <AvatarGroup max={3}>
          <Avatar src="https://i.pravatar.cc/150?u=a1" alt="Alice" />
          <Avatar src="https://i.pravatar.cc/150?u=a2" alt="Bob" />
          <Avatar src="https://i.pravatar.cc/150?u=a3" alt="Carol" />
          <Avatar src="https://i.pravatar.cc/150?u=a4" alt="Dave" />
          <Avatar alt="Eve" />
        </AvatarGroup>
      </div>
      <pre><code>{`<AvatarGroup max={3}>
  <Avatar src="..." alt="Alice" />
  <Avatar src="..." alt="Bob" />
  <Avatar src="..." alt="Carol" />
  <Avatar src="..." alt="Dave" />
  <Avatar alt="Eve" />
</AvatarGroup>`}</code></pre>

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
              <td className="py-2 font-mono text-xs text-brand-600">src</td>
              <td className="py-2 text-xs text-neutral-500">string</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
              <td className="py-2 text-xs text-neutral-500">Image URL</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">alt</td>
              <td className="py-2 text-xs text-neutral-500">string</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
              <td className="py-2 text-xs text-neutral-500">Alt text for the image</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">name</td>
              <td className="py-2 text-xs text-neutral-500">string</td>
              <td className="py-2 text-xs text-neutral-500">—</td>
              <td className="py-2 text-xs text-neutral-500">User name for fallback initials</td>
            </tr>
            <tr className="border-b border-neutral-100">
              <td className="py-2 font-mono text-xs text-brand-600">size</td>
              <td className="py-2 text-xs text-neutral-500">"xs" | "sm" | "md" | "lg" | "xl"</td>
              <td className="py-2 text-xs text-neutral-500">"md"</td>
              <td className="py-2 text-xs text-neutral-500">Size preset</td>
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
