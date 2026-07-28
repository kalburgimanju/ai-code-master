export interface SpinnerProps {
  /** Size */
  size?: "sm" | "md" | "lg";
  /** Color */
  color?: "brand" | "white" | "neutral";
  /** Label for screen readers */
  label?: string;
}

const sizeMap: Record<string, string> = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-10 h-10 border-3",
};

const colorMap: Record<string, string> = {
  brand: "border-brand-200 border-t-brand-600",
  white: "border-white/30 border-t-white",
  neutral: "border-neutral-200 border-t-neutral-600",
};

export default function Spinner({
  size = "md",
  color = "brand",
  label = "Loading...",
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={`inline-block rounded-full animate-spin ${sizeMap[size]} ${colorMap[color]}`}
    />
  );
}
