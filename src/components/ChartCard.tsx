export function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card-surface p-4 sm:p-5">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      <div className="mt-4 h-64 w-full">{children}</div>
    </section>
  );
}
