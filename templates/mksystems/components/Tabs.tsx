"use client";

import { useState, type ReactNode } from "react";

export interface TabItem {
  id: string;
  label: string;
  children: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  /** Initially active tab */
  defaultTab?: string;
  /** Controlled active tab */
  activeTab?: string;
  /** Called on tab change */
  onTabChange?: (id: string) => void;
}

export default function Tabs({
  items,
  defaultTab,
  activeTab,
  onTabChange,
}: TabsProps) {
  const [internal, setInternal] = useState(defaultTab || items[0]?.id);
  const current = activeTab ?? internal;

  const handleChange = (id: string) => {
    if (activeTab === undefined) setInternal(id);
    onTabChange?.(id);
  };

  const activeItem = items.find((t) => t.id === current);

  return (
    <div>
      <div className="flex border-b border-neutral-200 gap-0" role="tablist">
        {items.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={current === tab.id}
            disabled={tab.disabled}
            onClick={() => handleChange(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              current === tab.id
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
            } ${tab.disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="py-4">
        {activeItem?.children}
      </div>
    </div>
  );
}
