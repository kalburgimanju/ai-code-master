"use client";

import { useState, type ReactNode } from "react";

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  /** Position */
  position?: "top" | "bottom" | "left" | "right";
}

const positionStyles: Record<string, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

export default function Tooltip({
  content,
  children,
  position = "top",
}: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          role="tooltip"
          className={`absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded-lg shadow-lg whitespace-nowrap pointer-events-none ${positionStyles[position]}`}
        >
          {content}
        </div>
      )}
    </div>
  );
}
