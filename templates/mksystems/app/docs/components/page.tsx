import Link from "next/link";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    title: "Layout",
    components: [
      { name: "Card", desc: "Content container with default, outlined, and elevated variants.", href: "/docs/components/card" },
      { name: "Drawer", desc: "Slide-in panel for secondary content and navigation.", href: "/docs/components/drawer" },
      { name: "Accordion", desc: "Collapsible content sections for FAQs and accordions.", href: "/docs/components/accordion" },
      { name: "Tabs", desc: "Tabbed navigation with keyboard support.", href: "/docs/components/tabs" },
      { name: "Breadcrumb", desc: "Hierarchical navigation trail.", href: "/docs/components/breadcrumb" },
      { name: "Table", desc: "Data table with columns, striped rows, and hover effects.", href: "/docs/components/table" },
    ],
  },
  {
    title: "Forms",
    components: [
      { name: "Button", desc: "Interactive button with variants, sizes, and loading states.", href: "/docs/components/button" },
      { name: "Input", desc: "Text input with label, error, and helper text.", href: "/docs/components/input" },
      { name: "Textarea", desc: "Multi-line text input with auto-resize.", href: "/docs/components/textarea" },
      { name: "Select", desc: "Dropdown select with custom styling.", href: "/docs/components/select" },
      { name: "Checkbox", desc: "Toggle checkbox with label support.", href: "/docs/components/checkbox" },
      { name: "Radio", desc: "Radio button with group support.", href: "/docs/components/radio" },
    ],
  },
  {
    title: "Data Display",
    components: [
      { name: "Badge", desc: "Status indicator for labels and tags.", href: "/docs/components/badge" },
      { name: "Avatar", desc: "User avatar with image, initials, and group support.", href: "/docs/components/avatar" },
      { name: "Progress", desc: "Progress bar with labels and color variants.", href: "/docs/components/progress" },
      { name: "Spinner", desc: "Loading indicator with multiple sizes.", href: "/docs/components/spinner" },
    ],
  },
  {
    title: "Feedback",
    components: [
      { name: "Alert", desc: "Inline notification with dismissible support.", href: "/docs/components/alert" },
      { name: "Modal", desc: "Dialog overlay with keyboard and focus management.", href: "/docs/components/modal" },
      { name: "Toast", desc: "Temporary notification with auto-dismiss.", href: "/docs/components/toast" },
      { name: "Tooltip", desc: "Hover tooltip with position control.", href: "/docs/components/tooltip" },
    ],
  },
  {
    title: "Navigation",
    components: [
      { name: "Dropdown Menu", desc: "Action menu with icons and keyboard navigation.", href: "/docs/components/dropdown-menu" },
    ],
  },
];

export default function ComponentsPage() {
  return (
    <div>
      <h1>Components</h1>
      <p>
        MKSystems includes <strong>21 production-ready React components</strong> organized
        into 5 categories. Each component supports multiple variants, sizes,
        and is fully accessible.
      </p>

      {categories.map(({ title, components }) => (
        <div key={title}>
          <h2>{title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 not-prose my-4">
            {components.map(({ name, desc, href }) => (
              <Link
                key={name}
                href={href}
                className="group p-4 rounded-xl border border-neutral-100 hover:border-brand-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-neutral-900 group-hover:text-brand-700 transition-colors">
                    {name}
                  </h3>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-brand-500 transition-colors" />
                </div>
                <p className="text-xs text-neutral-500">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <h2>Installation</h2>
      <pre><code>{`npm install mksystems`}</code></pre>

      <h2>Import</h2>
      <pre><code>{`import { Button, Card, Badge, Modal, Tabs } from 'mksystems';`}</code></pre>
    </div>
  );
}
