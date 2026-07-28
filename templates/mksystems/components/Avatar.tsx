import { type ImgHTMLAttributes } from "react";

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "size"> {
  /** Avatar source URL */
  src?: string;
  /** Alt text */
  alt?: string;
  /** Size preset */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Fallback initials when no src */
  initials?: string;
}

const sizeMap: Record<string, string> = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-xl",
};

const bgColors = [
  "bg-brand-100 text-brand-700",
  "bg-success-100 text-success-700",
  "bg-warning-100 text-warning-700",
  "bg-error-100 text-error-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return bgColors[Math.abs(hash) % bgColors.length];
}

export default function Avatar({
  src,
  alt = "",
  size = "md",
  initials,
  className = "",
  ...props
}: AvatarProps) {
  const sizeClass = sizeMap[size];
  const fallback = initials || alt?.charAt(0)?.toUpperCase() || "?";
  const colorClass = getColor(alt || "default");

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-white ${className}`}
        {...props}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-semibold ${colorClass} ${className}`}
      role="img"
      aria-label={alt}
    >
      {fallback}
    </div>
  );
}

export interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export function AvatarGroup({ children, max = 3, size = "md" }: AvatarGroupProps) {
  const childArray = Array.isArray(children) ? children : [children];
  const visible = childArray.slice(0, max);
  const remaining = childArray.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((child, i) => (
        <div key={i} className="relative" style={{ zIndex: max - i }}>
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={`${sizeMap[size]} rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center text-xs font-medium ring-2 ring-white relative`}
          style={{ zIndex: 0 }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
