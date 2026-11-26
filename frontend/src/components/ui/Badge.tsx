export function Badge({ children, tone = "ink" }: { children: React.ReactNode; tone?: "ink" | "cream" | "matcha" | "sand" }) {
  const tones = {
    ink: "border-ink/20 text-ink/70",
    cream: "border-cream/30 text-cream/70",
    matcha: "border-matcha/40 text-matcha",
    sand: "border-sand/60 text-ink/70",
  };
  return (
    <span className={`inline-flex items-center border px-2.5 py-1 text-[9px] uppercase tracking-[0.22em] ${tones[tone]}`}>
      {children}
    </span>
  );
}
