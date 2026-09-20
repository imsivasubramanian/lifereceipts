import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Timeline } from "@/components/Timeline";
import { getChapters } from "@/lib/receipts";

export const Route = createFileRoute("/story")({
  head: () => ({
    meta: [
      { title: "The Story — LifeReceipts" },
      {
        name: "description",
        content: "Four data-backed chapters built from real counts across music, card and household records.",
      },
      { property: "og:title", content: "The Story — LifeReceipts" },
      { property: "og:description", content: "Moment → connection → pattern → chapter → insight." },
    ],
  }),
  component: Story,
});

function Story() {
  const chapters = useMemo(() => getChapters(), []);
  const [i, setI] = useState(0);
  const c = chapters[i]!;
  const search: Record<string, string> = {};
  if (c.filters.source) search.source = c.filters.source;
  if (c.filters.month) search.month = c.filters.month;

  return (
    <Shell>
      <header className="mb-6">
        <p className="eyebrow">Story mode</p>
        <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
          Small moments, read in order
        </h1>
      </header>

      <article className="card-surface p-6 sm:p-10">
        <p className="eyebrow">{c.eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{c.title}</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">{c.body}</p>

        <dl className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {c.stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-background/40 p-4">
              <dt className="eyebrow">{s.label}</dt>
              <dd className="mt-1 truncate font-display text-lg font-semibold text-primary">{s.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setI((v) => Math.max(0, v - 1))}
            disabled={i === 0}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous
          </button>
          <button
            type="button"
            onClick={() => setI((v) => Math.min(chapters.length - 1, v + 1))}
            disabled={i === chapters.length - 1}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm disabled:opacity-40"
          >
            Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <Link
            to="/explore"
            search={search}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Explore moment
          </Link>
          <span className="text-xs text-muted-foreground" role="status">
            Chapter {i + 1} of {chapters.length}
          </span>
        </div>
      </article>

      <div className="mt-8">
        <Timeline active={c?.filters.month} />
      </div>
    </Shell>
  );
}
