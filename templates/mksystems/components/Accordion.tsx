"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export interface AccordionItemProps {
  /** Unique key */
  id: string;
  /** Item header */
  header: ReactNode;
  /** Item content */
  children: ReactNode;
}

export interface AccordionProps {
  /** Accordion items */
  items: AccordionItemProps[];
  /** Allow multiple items open */
  multiple?: boolean;
  /** Initially open item IDs */
  defaultOpen?: string[];
}

function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: AccordionItemProps;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-neutral-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
        aria-expanded={isOpen}
      >
        {item.header}
        <ChevronDown
          className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-sm text-neutral-600 leading-relaxed">
          {item.children}
        </div>
      )}
    </div>
  );
}

export default function Accordion({
  items,
  multiple = false,
  defaultOpen = [],
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(defaultOpen));

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!multiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="rounded-xl border border-neutral-100 bg-white overflow-hidden">
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={openIds.has(item.id)}
          onToggle={() => toggle(item.id)}
        />
      ))}
    </div>
  );
}
