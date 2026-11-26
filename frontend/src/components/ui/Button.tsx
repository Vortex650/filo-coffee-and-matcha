import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "on-dark";
type Size = "sm" | "md";

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "inline-flex items-center justify-center gap-3 border text-[11px] uppercase tracking-[0.22em] transition duration-300 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-800 focus-visible:ring-offset-2 focus-visible:ring-offset-cream";
  const sizes: Record<Size, string> = {
    sm: "px-4 py-2.5",
    md: "px-6 py-3.5",
  };
  const styles: Record<Variant, string> = {
    primary: "border-burgundy-800 bg-burgundy-800 text-cream hover:border-burgundy-700 hover:bg-burgundy-700",
    secondary: "border-ink/25 bg-transparent text-ink hover:border-ink/60 hover:bg-ink/[0.04]",
    ghost: "border-transparent bg-transparent px-0 text-burgundy-800 hover:text-burgundy-700",
    "on-dark": "border-cream/35 bg-transparent text-cream hover:border-cream hover:bg-cream/10",
  };
  return (
    <button className={`${base} ${sizes[size]} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
