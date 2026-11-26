export function CircleMotif({
  className = "",
  rings = 5,
  dashed = false,
}: {
  className?: string;
  rings?: number;
  dashed?: boolean;
}) {
  const radii = Array.from({ length: rings }, (_, i) => 110 + i * 92);
  return (
    <svg viewBox="0 0 1000 1000" className={className} aria-hidden="true" focusable="false">
      {radii.map((r, i) => (
        <circle
          key={r}
          cx="500"
          cy="500"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={dashed && i % 2 === 1 ? 0.6 : 0.9}
          strokeDasharray={dashed && i % 2 === 1 ? "2 10" : undefined}
          opacity={0.34 - i * 0.05}
        />
      ))}
    </svg>
  );
}
