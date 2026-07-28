const colorTokens = [
  { group: "Brand", colors: [
    { name: "brand-50", value: "#eff6ff" }, { name: "brand-100", value: "#dbeafe" },
    { name: "brand-200", value: "#bfdbfe" }, { name: "brand-300", value: "#93c5fd" },
    { name: "brand-400", value: "#60a5fa" }, { name: "brand-500", value: "#3b82f6" },
    { name: "brand-600", value: "#2563eb" }, { name: "brand-700", value: "#1d4ed8" },
    { name: "brand-800", value: "#1e40af" }, { name: "brand-900", value: "#1e3a8a" },
  ]},
  { group: "Success", colors: [
    { name: "success-50", value: "#f0fdf4" }, { name: "success-500", value: "#22c55e" },
    { name: "success-600", value: "#16a34a" }, { name: "success-700", value: "#15803d" },
  ]},
  { group: "Warning", colors: [
    { name: "warning-50", value: "#fffbeb" }, { name: "warning-500", value: "#f59e0b" },
    { name: "warning-600", value: "#d97706" }, { name: "warning-700", value: "#b45309" },
  ]},
  { group: "Error", colors: [
    { name: "error-50", value: "#fef2f2" }, { name: "error-500", value: "#ef4444" },
    { name: "error-600", value: "#dc2626" }, { name: "error-700", value: "#b91c1c" },
  ]},
  { group: "Neutral", colors: [
    { name: "neutral-50", value: "#f8fafc" }, { name: "neutral-100", value: "#f1f5f9" },
    { name: "neutral-200", value: "#e2e8f0" }, { name: "neutral-300", value: "#cbd5e1" },
    { name: "neutral-400", value: "#94a3b8" }, { name: "neutral-500", value: "#64748b" },
    { name: "neutral-600", value: "#475569" }, { name: "neutral-700", value: "#334155" },
    { name: "neutral-800", value: "#1e293b" }, { name: "neutral-900", value: "#0f172a" },
  ]},
];

const spacingTokens = [
  { name: "xs", value: "4px", rem: "0.25rem" },
  { name: "sm", value: "8px", rem: "0.5rem" },
  { name: "md", value: "12px", rem: "0.75rem" },
  { name: "lg", value: "16px", rem: "1rem" },
  { name: "xl", value: "24px", rem: "1.5rem" },
  { name: "2xl", value: "32px", rem: "2rem" },
  { name: "3xl", value: "48px", rem: "3rem" },
];

const radiusTokens = [
  { name: "sm", value: "4px" },
  { name: "md", value: "8px" },
  { name: "lg", value: "12px" },
  { name: "xl", value: "16px" },
  { name: "full", value: "9999px" },
];

export default function TokensPage() {
  return (
    <div>
      <h1>Design Tokens</h1>
      <p>
        MKSystems uses CSS custom properties for all design values. Override
        these tokens to theme the entire system.
      </p>

      <h2>Colors</h2>
      {colorTokens.map(({ group, colors }) => (
        <div key={group} className="mb-6">
          <h3>{group}</h3>
          <div className="flex flex-wrap gap-3 not-prose">
            {colors.map(({ name, value }) => (
              <div key={name} className="flex items-center gap-2 bg-white border border-neutral-100 rounded-lg px-3 py-2">
                <div
                  className="w-6 h-6 rounded-md border border-neutral-200 flex-shrink-0"
                  style={{ backgroundColor: value }}
                />
                <div>
                  <p className="text-xs font-mono text-neutral-700">{name}</p>
                  <p className="text-[10px] text-neutral-400">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <h2>Spacing</h2>
      <div className="not-prose space-y-2">
        {spacingTokens.map(({ name, value, rem }) => (
          <div key={name} className="flex items-center gap-4">
            <span className="w-12 text-xs font-mono text-neutral-500">{name}</span>
            <div className="h-3 bg-brand-500 rounded" style={{ width: value }} />
            <span className="text-xs text-neutral-400">{value} ({rem})</span>
          </div>
        ))}
      </div>

      <h2>Border Radius</h2>
      <div className="flex gap-4 not-prose">
        {radiusTokens.map(({ name, value }) => (
          <div key={name} className="text-center">
            <div
              className="w-16 h-16 bg-brand-100 border-2 border-brand-300 mb-2"
              style={{ borderRadius: value }}
            />
            <p className="text-xs font-mono text-neutral-500">{name}</p>
            <p className="text-[10px] text-neutral-400">{value}</p>
          </div>
        ))}
      </div>

      <h2>Usage</h2>
      <pre><code>{`/* Override tokens in your CSS */
:root {
  --color-brand-500: #8b5cf6;  /* Change primary color */
  --radius-lg: 20px;           /* Change border radius */
}

/* Or use Tailwind classes */
<div className="bg-brand-500 rounded-lg p-4">
  Themed content
</div>`}</code></pre>
    </div>
  );
}
