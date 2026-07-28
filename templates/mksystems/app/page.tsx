import Link from "next/link";
import {
  Box,
  ArrowRight,
  Palette,
  Layers,
  Zap,
  Shield,
  Download,
  Code2,
} from "lucide-react";

const features = [
  {
    icon: Palette,
    title: "Design Tokens",
    desc: "Consistent colors, spacing, typography, and shadows as CSS custom properties. Theme your entire app in seconds.",
  },
  {
    icon: Layers,
    title: "21 Components",
    desc: "Button, Input, Card, Badge, Alert, Modal, Tabs, Table, Accordion, Drawer, and 11 more.",
  },
  {
    icon: Zap,
    title: "Zero Config",
    desc: "Copy-paste components into your project. No complex setup, no provider wrappers needed.",
  },
  {
    icon: Shield,
    title: "Accessible",
    desc: "Built with WAI-ARIA patterns, keyboard navigation, and screen reader support out of the box.",
  },
  {
    icon: Code2,
    title: "TypeScript",
    desc: "Full type definitions with intelligent autocomplete. Every prop is documented and typed.",
  },
  {
    icon: Download,
    title: "Track Usage",
    desc: "Built-in admin portal to monitor downloads, active users, and component adoption metrics.",
  },
];

const stats = [
  { value: "21", label: "Components" },
  { value: "50+", label: "Design Tokens" },
  { value: "100%", label: "TypeScript" },
  { value: "MIT", label: "License" },
];

export default function HomePage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/80 via-white to-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.12),transparent)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-medium mb-6">
              <Box className="w-3 h-3" />
              Open Source Design System
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 leading-[1.1]">
              Build Beautiful UIs
              <br />
              <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                with MKSystems
              </span>
            </h1>
            <p className="mt-6 text-lg text-neutral-500 leading-relaxed max-w-2xl mx-auto">
              A modern design system with production-ready React components,
              design tokens, and comprehensive documentation. Ship consistent,
              accessible interfaces faster.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/25"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/docs/components"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-neutral-700 font-medium rounded-xl border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all"
              >
                Browse Components
              </Link>
            </div>

            {/* Code snippet preview */}
            <div className="mt-12 max-w-lg mx-auto bg-neutral-900 rounded-xl p-5 text-left shadow-xl">
              <div className="flex items-center gap-1.5 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <pre className="text-sm leading-relaxed">
                <code>
                  <span className="text-purple-400">import</span>{" "}
                  <span className="text-green-300">{"{ Button }"}</span>{" "}
                  <span className="text-purple-400">from</span>{" "}
                  <span className="text-yellow-300">&apos;mksystems&apos;</span>
                  {";\n\n"}
                  <span className="text-blue-400">{"<"}</span>
                  <span className="text-red-400">Button</span>{" "}
                  <span className="text-blue-400">variant</span>
                  <span className="text-neutral-400">=</span>
                  <span className="text-yellow-300">&quot;primary&quot;</span>{" "}
                  <span className="text-blue-400">size</span>
                  <span className="text-neutral-400">=</span>
                  <span className="text-yellow-300">&quot;lg&quot;</span>
                  <span className="text-blue-400">{" >"}</span>
                  {"\n  Get Started\n"}
                  <span className="text-blue-400">{"</"}</span>
                  <span className="text-red-400">Button</span>
                  <span className="text-blue-400">{">"}</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-neutral-100 bg-neutral-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-extrabold text-brand-600">{value}</div>
                <div className="text-sm text-neutral-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-neutral-900">
            Everything you need
          </h2>
          <p className="mt-3 text-neutral-500 max-w-xl mx-auto">
            A complete toolkit for building modern, consistent user interfaces.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group p-6 rounded-2xl border border-neutral-100 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-50 transition-all"
            >
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-600 transition-colors">
                <Icon className="w-5 h-5 text-brand-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 mb-1.5">{title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-brand-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to build?
          </h2>
          <p className="mt-3 text-brand-100 max-w-lg mx-auto">
            Start using MKSystems in your project today. Free and open source.
          </p>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-white text-brand-700 font-medium rounded-xl hover:bg-brand-50 transition-colors shadow-lg"
          >
            Read the Docs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
