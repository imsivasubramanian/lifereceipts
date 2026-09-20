import { MapPin, Tag } from "lucide-react";
import { SOURCE_META, formatAmount, formatDate, type Receipt } from "@/lib/receipts";

export function ReceiptCard({ r, onOpen }: { r: Receipt; onOpen: (r: Receipt) => void }) {
  const meta = SOURCE_META[r.source];
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(r)}
        className="card-surface group w-full p-4 text-left transition-colors hover:border-primary/60"
        aria-label={`Open receipt: ${r.title}`}
      >
        <div className="flex items-start justify-between gap-3">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-[11px] uppercase tracking-wider"
            style={{ color: meta.color }}
          >
            <span aria-hidden="true">{meta.icon}</span>
            {meta.label}
          </span>
          <time className="shrink-0 text-[11px] text-muted-foreground" dateTime={r.timestamp}>
            {formatDate(r.timestamp)}
          </time>
        </div>
        <h3 className="mt-3 truncate font-display text-base font-semibold">{r.title}</h3>
        {r.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Tag className="h-3 w-3" aria-hidden="true" />
            <span className="max-w-[12rem] truncate">{r.category}</span>
          </span>
          {r.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              {r.location}
            </span>
          )}
          {r.platform && <span>{r.platform}</span>}
          {r.amount != null && (
            <span className="ml-auto font-medium text-primary">{formatAmount(r.amount)}</span>
          )}
        </div>
      </button>
    </li>
  );
}
