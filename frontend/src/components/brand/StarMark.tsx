export function StarMark({ className = "h-5 w-5", title = "Filo star" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} role="img" aria-label={title}>
      <path d="M12 0c.6 6.3 5.7 11.4 12 12-6.3.6-11.4 5.7-12 12C11.4 17.7 6.3 12.6 0 12 6.3 11.4 11.4 6.3 12 0Z" />
    </svg>
  );
}
