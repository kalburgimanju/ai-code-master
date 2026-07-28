export interface ProgressProps {
  /** Progress value 0-100 */
  value: number;
  /** Size */
  size?: "sm" | "md" | "lg";
  /** Color variant */
  variant?: "brand" | "success" | "warning" | "error";
  /** Show label */
  showLabel?: boolean;
  /** Label text */
  label?: string;
}

const variantColors: Record<string, string> = {
  brand: "bg-brand-600",
  success: "bg-success-600",
  warning: "bg-warning-500",
  error: "bg-error-600",
};

const sizeMap: Record<string, string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export default function Progress({
  value,
  size = "md",
  variant = "brand",
  showLabel = false,
  label,
}: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-neutral-700">
            {label || "Progress"}
          </span>
          <span className="text-sm text-neutral-500 font-mono">{Math.round(clamped)}%</span>
        </div>
      )}
      <div
        className={`w-full bg-neutral-100 rounded-full overflow-hidden ${sizeMap[size]}`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || "Progress"}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${variantColors[variant]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
