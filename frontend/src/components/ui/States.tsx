import { CircleMotif } from "../brand/CircleMotif";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-ink/[0.06] motion-reduce:animate-none ${className}`} aria-hidden="true" />;
}

export function EmptyState({ title, copy }: { title: string; copy?: string }) {
  return (
    <div className="border border-ink/10 px-6 py-16 text-center">
      <CircleMotif className="mx-auto h-16 w-16 text-burgundy-800/40" rings={3} />
      <p className="mt-6 font-heading text-2xl">{title}</p>
      {copy && <p className="mx-auto mt-2 max-w-sm text-sm text-ink/70">{copy}</p>}
    </div>
  );
}
