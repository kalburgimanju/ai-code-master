"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export interface DrawerProps {
  /** Whether drawer is open */
  open: boolean;
  /** Called when drawer should close */
  onClose: () => void;
  /** Drawer title */
  title?: string;
  /** Position */
  position?: "left" | "right";
  /** Width */
  size?: "sm" | "md" | "lg";
  /** Drawer content */
  children: ReactNode;
}

const sizeMap: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export default function Drawer({
  open,
  onClose,
  title,
  position = "right",
  size = "md",
  children,
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const slideClass =
    position === "right"
      ? "translate-x-full"
      : "-translate-x-full";

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className={`absolute top-0 ${position === "right" ? "right-0" : "left-0"} h-full w-full ${sizeMap[size]} bg-white shadow-xl flex flex-col`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
