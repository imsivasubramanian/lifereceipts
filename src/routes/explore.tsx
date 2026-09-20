import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Inbox } from "lucide-react";
import { Shell } from "@/components/Shell";
import { FilterBar } from "@/components/FilterBar";
import { ReceiptCard } from "@/components/ReceiptCard";
import { ReceiptModal } from "@/components/ReceiptModal";
import { emptyFilters, filterRecords, type Filters, type Receipt } from "@/lib/receipts";

type Search = { source?: string; month?: string; category?: string; q?: string };

export const Route = createFileRoute("/explore")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    source: typeof s.source === "string" ? s.source : undefined,
    month: typeof s.month === "string" ? s.month : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Explore Receipts — LifeReceipts" },
      {
        name: "description",
        content: "Search and filter music, card and household receipts across sources, categories, years and places.",
      },
      { property: "og:title", content: "Explore Receipts — LifeReceipts" },
      { property: "og:description", content: "Search and filter every receipt in one unified explorer." },
    ],
  }),
  component: Explore,
});

const PAGE_SIZE = 12;

function Explore() {
  const search = Route.useSearch();
  const [filters, setFiltersState] = useState<Filters>({
    ...emptyFilters,
    source: search.source ?? "all",
    category: search.category ?? "all",
    q: search.q ?? "",
    month: search.month ?? "",
  });
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Receipt | null>(null);

  const setFilters = (f: Filters) => {
    setFiltersState(f);
    setPage(0);
  };

  const results = useMemo(() => filterRecords(filters), [filters]);
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visible = results.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  return (
    <Shell>
      <header className="mb-6">
        <p className="eyebrow">Explore</p>
        <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Receipt explorer</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          One searchable stream of music, card and household receipts. Filters combine; results are
          paginated for speed.
        </p>
      </header>

      <FilterBar filters={filters} setFilters={setFilters} resultCount={results.length} />

      {visible.length === 0 ? (
        <div className="card-surface mt-6 flex flex-col items-center gap-3 p-12 text-center">
          <Inbox className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h2 className="font-display text-lg">Nothing matched this combination</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Try a broader search term, or clear the filters to return to the full record.
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((r) => (
            <ReceiptCard key={r.id} r={r} onOpen={setSelected} />
          ))}
        </ul>
      )}

      <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setPage(Math.max(0, current - 1))}
          disabled={current === 0}
          className="rounded-md border border-border px-4 py-2 text-sm disabled:opacity-40"
        >
          Previous
        </button>
        <span className="text-sm text-muted-foreground" role="status">
          Page {current + 1} of {pages}
        </span>
        <button
          type="button"
          onClick={() => setPage(Math.min(pages - 1, current + 1))}
          disabled={current >= pages - 1}
          className="rounded-md border border-border px-4 py-2 text-sm disabled:opacity-40"
        >
          Next
        </button>
      </nav>

      <ReceiptModal r={selected} onClose={() => setSelected(null)} />
    </Shell>
  );
}
