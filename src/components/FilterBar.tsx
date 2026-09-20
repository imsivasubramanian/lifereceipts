import { Search, XCircle } from "lucide-react";
import {
  categoriesBySource,
  locations,
  years,
  type Filters,
} from "@/lib/receipts";

const selectCls =
  "w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground";

export function FilterBar({
  filters,
  setFilters,
  resultCount,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  resultCount: number;
}) {
  const cats =
    filters.source === "all"
      ? Object.values(categoriesBySource).flat().sort().slice(0, 500)
      : categoriesBySource[filters.source] || [];

  const set = (patch: Partial<Filters>) => setFilters({ ...filters, ...patch });

  return (
    <section aria-label="Filters" className="card-surface p-4">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <label htmlFor="q" className="sr-only">
          Search receipts
        </label>
        <input
          id="q"
          type="search"
          value={filters.q}
          onChange={(e) => { console.log("QCHANGE", e.target.value); set({ q: e.target.value }); }}
          placeholder="Search tracks, merchants, notes, places…"
          className="w-full rounded-md border border-border bg-secondary py-2.5 pl-9 pr-3 text-sm"
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="f-source" className="eyebrow mb-1 block">
            Source
          </label>
          <select
            id="f-source"
            className={selectCls}
            value={filters.source}
            onChange={(e) => set({ source: e.target.value, category: "all" })}
          >
            <option value="all">All sources</option>
            <option value="spotify">Music</option>
            <option value="transactions">Transactions</option>
            <option value="household">Daily Life</option>
          </select>
        </div>
        <div>
          <label htmlFor="f-cat" className="eyebrow mb-1 block">
            Category
          </label>
          <select
            id="f-cat"
            className={selectCls}
            value={filters.category}
            onChange={(e) => set({ category: e.target.value })}
          >
            <option value="all">All categories</option>
            {cats.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-year" className="eyebrow mb-1 block">
            Year
          </label>
          <select
            id="f-year"
            className={selectCls}
            value={filters.year}
            onChange={(e) => set({ year: e.target.value, month: "" })}
          >
            <option value="all">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-loc" className="eyebrow mb-1 block">
            Location
          </label>
          <select
            id="f-loc"
            className={selectCls}
            value={filters.location}
            onChange={(e) => set({ location: e.target.value })}
          >
            <option value="all">Anywhere</option>
            {locations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground" role="status">
          {resultCount.toLocaleString()} matching receipts
          {filters.month ? ` · month ${filters.month}` : ""}
        </p>
        <button
          type="button"
          onClick={() =>
            setFilters({ q: "", source: "all", category: "all", year: "all", location: "all", month: "" })
          }
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs hover:border-primary/60"
        >
          <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
          Clear filters
        </button>
      </div>
    </section>
  );
}
