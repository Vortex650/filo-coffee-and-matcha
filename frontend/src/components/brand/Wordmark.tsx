import { StarMark } from "./StarMark";

export function Wordmark({
  className = "",
  tone = "ink",
  subtitle = true,
}: {
  className?: string;
  tone?: "ink" | "cream";
  subtitle?: boolean;
}) {
  const color = tone === "cream" ? "text-cream" : "text-ink";
  return (
    <span className={`inline-flex items-center gap-3 ${color} ${className}`}>
      <StarMark className={`h-5 w-5 ${tone === "cream" ? "text-cream/80" : "text-burgundy-800"}`} />
      <span className="flex flex-col leading-none">
        <span className="font-heading text-[1.55em] tracking-[0.02em]">Filo</span>
        {subtitle && (
          <span className={`mt-1 text-[0.44em] uppercase tracking-[0.3em] ${tone === "cream" ? "text-cream/65" : "text-ink/65"}`}>
            Coffee &amp; Matcha
          </span>
        )}
      </span>
    </span>
  );
}
