import { type HTMLAttributes } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visual variant */
  variant?: "default" | "success" | "warning" | "error" | "info";
  /** Size preset */
  size?: "sm" | "md";
}

const variantStyles: Record<string, string> = {
  default: "bg-neutral-100 text-neutral-700",
  success: "bg-success-50 text-success-700 ring-1 ring-success-500/20",
  warning: "bg-warning-50 text-warning-700 ring-1 ring-warning-500/20",
  error: "bg-error-50 text-error-700 ring-1 ring-error-500/20",
  info: "bg-info-50 text-info-700 ring-1 ring-info-500/20",
};

const sizeStyles: Record<string, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
};

export default function Badge({
  variant = "default",
  size = "md",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
