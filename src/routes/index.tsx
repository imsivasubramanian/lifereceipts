import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Timeline } from "@/components/Timeline";
import { aggregates, SOURCE_META } from "@/lib/receipts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LifeReceipts — Your Life, In Receipts" },
      {
        name: "description",
        content:
          "Three streams of everyday activity — music, transactions and household records — explored as one interactive data story.",
      },
      { property: "og:title", content: "LifeReceipts — Your Life, In Receipts" },
      {
        property: "og:description",
        content: "Small moments. Hidden patterns. One story.",
      },
    ],
  }),
  component: Overview,
});

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-surface p-4">
      <p className="eyebrow">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-primary">{value}</p>
    </div>
  );
}

function Overview() {
  const a = aggregates;
  const navigate = useNavigate();
  const t = a.totals;

  const sourceCards = [
    {
      key: "spotify" as const,
      count: t.spotifyPlays.toLocaleString() + " plays",
      note: `${t.listeningHours.toLocaleString()} hours of listening · ${a.topArtists.length} top artists tracked`,
    },
    {
      key: "transactions" as const,
      count: t.transactions.toLocaleString() + " records",
      note: `${a.txCategories.length} categories · ${a.topLocations.length} locations`,
    },
    {
      key: "household" as const,
      count: t.household.toLocaleString() + " entries",
      note: `Income ₹${a.incomeVsExpense[0].value.toLocaleString()} · Expense ₹${a.incomeVsExpense[1].value.toLocaleString()}`,
    },
  ];

  return (
    <Shell>
      <section className="py-6 sm:py-12">
        <p className="eyebrow inline-flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> Small moments. Hidden
          patterns. One story.
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-6xl">
          Your life,
          <br />
          in receipts
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          Three streams of everyday activity. Patterns hidden between the moments.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Explore receipts <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            to="/connections"
            className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium hover:border-primary/60"
          >
            Discover connections
          </Link>
        </div>
      </section>

      <section aria-label="Key statistics" className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Total records" value={(t.spotifyPlays + t.transactions + t.household).toLocaleString()} />
        <Stat label="Spotify moments" value={t.spotifyPlays.toLocaleString()} />
        <Stat label="Transactions" value={t.transactions.toLocaleString()} />
        <Stat label="Household records" value={t.household.toLocaleString()} />
        <Stat label="Categories" value={String(a.categories)} />
        <Stat label="Date span" value={`${a.dateSpan.start.slice(0, 4)}–${a.dateSpan.end.slice(0, 4)}`} />
      </section>

      <section aria-label="Sources" className="mt-10 grid gap-4 md:grid-cols-3">
        {sourceCards.map((s) => {
          const meta = SOURCE_META[s.key];
          return (
            <Link
              key={s.key}
              to="/explore"
              search={{ source: s.key }}
              className="card-surface p-5 transition-colors hover:border-primary/60"
            >
              <span className="text-2xl" aria-hidden="true">
                {meta.icon}
              </span>
              <h2 className="mt-3 font-display text-xl font-semibold" style={{ color: meta.color }}>
                {meta.label}
              </h2>
              <p className="mt-1 text-sm font-medium">{s.count}</p>
              <p className="mt-2 text-xs text-muted-foreground">{s.note}</p>
            </Link>
          );
        })}
      </section>

      <div className="mt-10">
        <Timeline onPick={(month) => navigate({ to: "/explore", search: { month } })} />
      </div>
    </Shell>
  );
}
