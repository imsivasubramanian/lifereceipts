import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { SOURCE_META, formatAmount, formatDate, type Receipt } from "@/lib/receipts";

export function ReceiptModal({ r, onClose }: { r: Receipt | null; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!r) return;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [r, onClose]);

  if (!r) return null;
  const meta = SOURCE_META[r.source];
  const rows: [string, string][] = [
    ["Source", meta.label],
    ["Date", formatDate(r.timestamp)],
    ["Type", r.type],
    ["Category", r.category],
  ];
  if (r.amount != null) rows.push(["Amount", formatAmount(r.amount)!]);
  if (r.location) rows.push(["Location", r.location]);
  if (r.platform) rows.push(["Platform", r.platform]);
  Object.entries(r.metadata || {}).forEach(([k, v]) => {
    if (v === null || v === undefined || v === "") return;
    rows.push([k, String(v)]);
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Receipt details: ${r.title}`}
        tabIndex={-1}
        ref={ref}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-card p-5 sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow" style={{ color: meta.color }}>
              {meta.icon} {meta.label} receipt
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold">{r.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="rounded-md border border-border p-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {r.description && <p className="mt-3 text-sm text-muted-foreground">{r.description}</p>}
        <dl className="mt-5 divide-y divide-border border-y border-border text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex gap-4 py-2">
              <dt className="w-32 shrink-0 capitalize text-muted-foreground">{k}</dt>
              <dd className="break-words">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs text-muted-foreground">
          Identity fields from the source data (names, card numbers, IDs, dates of birth, street
          addresses) are excluded from this application.
        </p>
      </div>
    </div>
  );
}
