import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDown, Check, Link2 } from "lucide-react";
import { Shell } from "@/components/Shell";
import { ReceiptModal } from "@/components/ReceiptModal";
import { getConnections, SOURCE_META, formatAmount, formatDate, type Receipt } from "@/lib/receipts";

export const Route = createFileRoute("/connections")({
  head: () => ({
    meta: [
      { title: "Connected Moments — LifeReceipts" },
      {
        name: "description",
        content: "Days where music, card and household activity overlap — every link shown with its reason.",
      },
      { property: "og:title", content: "Connected Moments — LifeReceipts" },
      { property: "og:description", content: "Cross-source relationships found by day, time and category." },
    ],
  }),
  component: Connections,
});

function Connections() {
  const connections = useMemo(() => getConnections(), []);
  const [activeId, setActiveId] = useState(connections[0]?.id);
  const [selected, setSelected] = useState<Receipt | null>(null);
  const active = connections.find((c) => c.id === activeId) ?? connections[0];

  return (
    <Shell>
      <header className="mb-6">
        <p className="eyebrow">Connections</p>
        <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Connected moments</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Records are grouped by calendar day using an index, then kept only when more than one
          source is present. Every connection lists the rules that produced it.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <section aria-label="Connection list" className="card-surface max-h-[28rem] overflow-y-auto p-2 lg:max-h-[42rem]">
          <ul>
            {connections.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  aria-current={c.id === active?.id}
                  className={`w-full rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                    c.id === active?.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="font-medium">{c.day}</span>
                  <span className="mt-0.5 block text-xs">
                    {c.items.map((i) => SOURCE_META[i.source].icon).join(" → ")} · {c.reasons.length} reasons
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {active && (
          <section aria-label="Connection detail" className="card-surface p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" aria-hidden="true" />
              <h2 className="font-display text-xl font-semibold">{active.day}</h2>
            </div>

            <ol className="mt-5">
              {active.items.map((r, i) => {
                const meta = SOURCE_META[r.source];
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(r)}
                      className="w-full rounded-lg border border-border bg-background/40 p-4 text-left transition-colors hover:border-primary/60"
                    >
                      <span className="text-xs uppercase tracking-wider" style={{ color: meta.color }}>
                        {meta.icon} {meta.label}
                      </span>
                      <span className="mt-1 block truncate font-medium">{r.title}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {formatDate(r.timestamp)} · {r.category}
                        {r.amount != null ? ` · ${formatAmount(r.amount)}` : ""}
                      </span>
                    </button>
                    {i < active.items.length - 1 && (
                      <div className="flex justify-center py-2" aria-hidden="true">
                        <ArrowDown className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>

            <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <h3 className="eyebrow">Why connected?</h3>
              <ul className="mt-2 space-y-1.5 text-sm">
                {active.reasons.map((reason) => (
                  <li key={reason} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>

      <ReceiptModal r={selected} onClose={() => setSelected(null)} />
    </Shell>
  );
}
