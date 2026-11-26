export function Container({
  children,
  className = "",
  size = "default",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "wide" | "narrow";
}) {
  const widths = {
    default: "max-w-6xl",
    wide: "max-w-[1440px]",
    narrow: "max-w-3xl",
  };
  return <div className={`mx-auto w-full ${widths[size]} px-5 md:px-10 ${className}`}>{children}</div>;
}

export function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return <section id={id} className={`py-20 md:py-32 ${className}`}>{children}</section>;
}
