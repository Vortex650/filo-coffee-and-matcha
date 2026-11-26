export function SectionHeading({
  eyebrow,
  title,
  copy,
  align = "left",
  tone = "dark",
  level = 2,
  className = "",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  copy?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
  level?: 1 | 2 | 3;
  className?: string;
}) {
  const alignment = align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl";
  const Heading = `h${level}` as "h1" | "h2" | "h3";
  return (
    <div className={`${alignment} ${className}`}>
      {eyebrow && (
        <p
          className={`flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] ${
            align === "center" ? "justify-center" : ""
          } ${tone === "light" ? "text-cream/65" : "text-burgundy-800"}`}
        >
          <span className={`h-px w-8 ${tone === "light" ? "bg-cream/30" : "bg-burgundy-800/30"}`} aria-hidden />
          {eyebrow}
        </p>
      )}
      <Heading className={`mt-5 font-heading text-[clamp(2.4rem,5vw,4rem)] leading-[1.05] ${tone === "light" ? "text-cream" : "text-ink"}`}>
        {title}
      </Heading>
      {copy && (
        <p className={`mt-6 text-[15px] leading-[1.9] ${tone === "light" ? "text-cream/65" : "text-ink/65"}`}>{copy}</p>
      )}
    </div>
  );
}
