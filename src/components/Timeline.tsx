import { aggregates } from "@/lib/receipts";

export function Timeline({ onPick, active }: { onPick?: (month: string) => void; active?: string }) {
  const monthly = aggregates.monthly as {
    month: string;
    spotify: number;
    transactions: number;
    household: number;
  }[];
  const max = Math.max(...monthly.map((m) => m.spotify + m.transactions + m.household));

  return (
    <section aria-label="Activity timeline" className="card-surface p-4 sm:p-6">
      <p className="eyebrow">Digital journey</p>
      <h2 className="mt-1 font-display text-xl font-semibold">Activity density by month</h2>
      <div className="mt-4 overflow-x-auto pb-2">
        <ul className="flex min-w-max items-end gap-[3px]" style={{ height: 120 }}>
          {monthly.map((m) => {
            const total = m.spotify + m.transactions + m.household;
            const h = Math.max(4, (total / max) * 110);
            const isActive = active === m.month;
            return (
              <li key={m.month} className="flex h-full items-end">
                <button
                  type="button"
                  onClick={() => onPick?.(m.month)}
                  title={`${m.month}: ${total.toLocaleString()} records`}
                  aria-label={`${m.month}, ${total} records`}
                  className="w-[7px] rounded-sm transition-opacity hover:opacity-100"
                  style={{
                    height: h,
                    opacity: isActive ? 1 : 0.65,
                    background: isActive
                      ? "var(--primary)"
                      : "linear-gradient(to top, var(--household), var(--spotify))",
                  }}
                />
              </li>
            );
          })}
        </ul>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {monthly[0].month} → {monthly[monthly.length - 1].month}. Select a bar to explore that month.
      </p>
    </section>
  );
}
