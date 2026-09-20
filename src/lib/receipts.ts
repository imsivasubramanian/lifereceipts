import recordsRaw from "@/data/records.json";
import aggregatesRaw from "@/data/aggregates.json";

export type Source = "spotify" | "transactions" | "household";

export type Receipt = {
  id: string;
  source: Source;
  timestamp: string;
  type: string;
  title: string;
  description: string;
  category: string;
  amount: number | null;
  location: string | null;
  platform: string | null;
  metadata: Record<string, unknown>;
};

export const records = recordsRaw as unknown as Receipt[];
export const aggregates = aggregatesRaw as any;

export const SOURCE_META: Record<Source, { label: string; icon: string; color: string }> = {
  spotify: { label: "Music", icon: "🎵", color: "var(--spotify)" },
  transactions: { label: "Transactions", icon: "💳", color: "var(--transactions)" },
  household: { label: "Daily Life", icon: "💰", color: "var(--household)" },
};

export const years = Array.from(new Set(records.map((r) => r.timestamp.slice(0, 4)))).sort();

export const categoriesBySource: Record<string, string[]> = (() => {
  const map: Record<string, Set<string>> = {};
  for (const r of records) (map[r.source] ||= new Set()).add(r.category);
  const out: Record<string, string[]> = {};
  for (const k of Object.keys(map)) out[k] = [...(map[k] ?? [])].sort().slice(0, 400);
  return out;
})();

export const locations = Array.from(
  new Set(records.map((r) => r.location).filter(Boolean) as string[]),
).sort();

export type Filters = {
  q: string;
  source: string;
  category: string;
  year: string;
  location: string;
  month?: string;
};

export const emptyFilters: Filters = {
  q: "",
  source: "all",
  category: "all",
  year: "all",
  location: "all",
  month: "",
};

export function filterRecords(f: Filters, limit = 600): { items: Receipt[]; total: number } {
  const q = f.q.trim().toLowerCase();
  const out: Receipt[] = [];
  let total = 0;
  for (const r of records) {
    if (f.source !== "all" && r.source !== f.source) continue;
    if (f.category !== "all" && r.category !== f.category) continue;
    if (f.year !== "all" && r.timestamp.slice(0, 4) !== f.year) continue;
    if (f.month && r.timestamp.slice(0, 7) !== f.month) continue;
    if (f.location !== "all" && r.location !== f.location) continue;
    if (
      q &&
      !(
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        (r.location || "").toLowerCase().includes(q)
      )
    )
      continue;
    total++;
    if (out.length < limit) out.push(r);
  }
  return { items: out, total };
}

export function formatDate(ts: string) {
  return new Date(ts + "Z").toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export function formatAmount(n: number | null) {
  if (n == null) return null;
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

/* ---------------- Connections (index-based, no O(n^2)) ---------------- */

export type ConnectionReason = { rule: string; evidence: string };

export type Connection = {
  id: string;
  day: string;
  month: string;
  items: Receipt[];
  counts: { source: Source; count: number }[];
  totalRecords: number;
  spend: number;
  spanLabel: string;
  reasons: ConnectionReason[];
};

const hhmm = (ts: string) => ts.slice(11, 16);

let cachedConnections: Connection[] | null = null;

export function getConnections(): Connection[] {
  if (cachedConnections) return cachedConnections;

  // Single pass indexes — no pairwise comparison.
  const byDay = new Map<string, Receipt[]>();
  const monthCategoryDays = new Map<string, Set<string>>();
  for (const r of records) {
    const day = r.timestamp.slice(0, 10);
    const list = byDay.get(day);
    if (list) list.push(r);
    else byDay.set(day, [r]);

    const mk = r.timestamp.slice(0, 7) + "|" + r.category;
    const days = monthCategoryDays.get(mk);
    if (days) days.add(day);
    else monthCategoryDays.set(mk, new Set([day]));
  }

  const order: Source[] = ["spotify", "transactions", "household"];
  const out: Connection[] = [];

  for (const [day, all] of byDay) {
    const sources = new Set(all.map((i) => i.source));
    if (sources.size < 2) continue;

    const sorted = [...all].sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
    const month = day.slice(0, 7);

    // Category → the distinct sources it appears in on this day.
    const catSources = new Map<string, Set<Source>>();
    const locationCounts = new Map<string, number>();
    let spend = 0;
    let txCount = 0;
    for (const r of sorted) {
      const cs = catSources.get(r.category);
      if (cs) cs.add(r.source);
      else catSources.set(r.category, new Set([r.source]));
      if (r.location) locationCounts.set(r.location, (locationCounts.get(r.location) ?? 0) + 1);
      if (r.amount != null && r.amount > 0) {
        spend += r.amount;
        txCount += 1;
      }
    }

    const counts = order
      .map((s) => ({ source: s, count: sorted.filter((r) => r.source === s).length }))
      .filter((c) => c.count > 0);

    const first = sorted[0]!;
    const last = sorted[sorted.length - 1]!;
    const spanMin = Math.round(
      (new Date(last.timestamp + "Z").getTime() - new Date(first.timestamp + "Z").getTime()) / 60000,
    );
    const spanLabel =
      spanMin >= 60 ? `${Math.floor(spanMin / 60)}h ${spanMin % 60}m` : `${spanMin} min`;

    const reasons: ConnectionReason[] = [
      {
        rule: "Same day",
        evidence: `${sorted.length} records share the date ${day}: ${counts
          .map((c) => `${c.count} ${SOURCE_META[c.source].label.toLowerCase()}`)
          .join(", ")}.`,
      },
      {
        rule: "Cross-source overlap",
        evidence: `${sources.size} of 3 streams are active — ${[...sources]
          .map((s) => SOURCE_META[s].label)
          .join(" and ")}.`,
      },
      {
        rule: "Time window",
        evidence: `First record ${hhmm(first.timestamp)} (${SOURCE_META[first.source].label}), last ${hhmm(
          last.timestamp,
        )} (${SOURCE_META[last.source].label}) — a span of ${spanLabel}.`,
      },
    ];

    // Nearby timestamps: smallest gap between two records from different sources.
    let closest: { gap: number; a: Receipt; b: Receipt } | null = null;
    for (let i = 1; i < sorted.length; i++) {
      const a = sorted[i - 1]!;
      const b = sorted[i]!;
      if (a.source === b.source) continue;
      const gap = Math.round(
        (new Date(b.timestamp + "Z").getTime() - new Date(a.timestamp + "Z").getTime()) / 60000,
      );
      if (!closest || gap < closest.gap) closest = { gap, a, b };
    }
    if (closest && closest.gap <= 180) {
      reasons.push({
        rule: "Nearby timestamps",
        evidence: `${SOURCE_META[closest.a.source].label} "${closest.a.title}" at ${hhmm(
          closest.a.timestamp,
        )} and ${SOURCE_META[closest.b.source].label} "${closest.b.title}" at ${hhmm(
          closest.b.timestamp,
        )} are ${closest.gap} min apart.`,
      });
    }

    // A category that shows up in more than one source on the same day.
    for (const [cat, cs] of catSources) {
      if (cs.size > 1) {
        reasons.push({
          rule: "Shared category",
          evidence: `"${cat}" appears in ${[...cs].map((s) => SOURCE_META[s].label).join(" and ")} on this day.`,
        });
        break;
      }
    }

    // Repeated category within the month, measured across the index.
    let repeated: { cat: string; days: number } | null = null;
    for (const cat of catSources.keys()) {
      const days = monthCategoryDays.get(month + "|" + cat)?.size ?? 0;
      if (!repeated || days > repeated.days) repeated = { cat, days };
    }
    if (repeated && repeated.days > 1) {
      reasons.push({
        rule: "Repeated category",
        evidence: `"${repeated.cat}" also appears on ${repeated.days - 1} other day${
          repeated.days - 1 === 1 ? "" : "s"
        } in ${month}.`,
      });
    }

    if (txCount > 0) {
      reasons.push({
        rule: "Money moved",
        evidence: `${formatAmount(spend)} recorded across ${txCount} priced record${txCount === 1 ? "" : "s"}.`,
      });
    }

    const topLocation = [...locationCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (topLocation && topLocation[1] > 1) {
      reasons.push({
        rule: "Same location",
        evidence: `${topLocation[1]} records share the location ${topLocation[0]}.`,
      });
    }

    // Keep a readable chronological slice: first record of each source plus nearest neighbours.
    const items: Receipt[] = [];
    for (const s of order) {
      const firstOfSource = sorted.find((r) => r.source === s);
      if (firstOfSource) items.push(firstOfSource);
    }
    if (closest) {
      for (const r of [closest.a, closest.b]) if (!items.includes(r)) items.push(r);
    }
    items.sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));

    out.push({
      id: day,
      day,
      month,
      items,
      counts,
      totalRecords: sorted.length,
      spend,
      spanLabel,
      reasons,
    });
  }

  cachedConnections = out
    .sort(
      (a, b) =>
        b.counts.length - a.counts.length ||
        b.reasons.length - a.reasons.length ||
        b.totalRecords - a.totalRecords ||
        (a.day < b.day ? 1 : -1),
    )
    .slice(0, 60);
  return cachedConnections;
}

/* ---------------- Story chapters from real values ---------------- */

export type Chapter = {
  title: string;
  eyebrow: string;
  body: string;
  stats: { label: string; value: string }[];
  filters: Partial<Filters>;
};

export function getChapters(): Chapter[] {
  const a = aggregates;
  const hours = a.hours as { hour: string; count: number }[];
  const peakHour = [...hours].sort((x, y) => y.count - x.count)[0];
  const busiestMonth = [...a.monthly].sort(
    (x: any, y: any) =>
      y.spotify + y.transactions + y.household - (x.spotify + x.transactions + x.household),
  )[0];
  const topTxCat = a.txCategories[0];
  const topHh = a.householdCategories[0];
  const topArtist = a.topArtists[0];
  const connections = getConnections();

  return [
    {
      eyebrow: "Chapter 01",
      title: "The Soundtrack",
      body: `Between ${a.dateSpan.start} and ${a.dateSpan.end}, ${a.totals.spotifyPlays.toLocaleString()} listening events were recorded — about ${a.totals.listeningHours.toLocaleString()} hours of audio. ${topArtist.name} appears most often with ${topArtist.plays.toLocaleString()} plays. Listening activity peaks around ${peakHour?.hour ?? "—"}.`,
      stats: [
        { label: "Plays", value: a.totals.spotifyPlays.toLocaleString() },
        { label: "Hours", value: a.totals.listeningHours.toLocaleString() },
        { label: "Skip rate", value: a.totals.skipRate + "%" },
      ],
      filters: { source: "spotify" },
    },
    {
      eyebrow: "Chapter 02",
      title: "The Spending Trail",
      body: `${a.totals.transactions.toLocaleString()} card transactions were recorded. The most frequent category is "${topTxCat.name}" with ${topTxCat.value.toLocaleString()} entries. Transactions carry city and state only — identity fields are excluded from this view.`,
      stats: [
        { label: "Transactions", value: a.totals.transactions.toLocaleString() },
        { label: "Top category", value: topTxCat.name },
        { label: "Places", value: String(a.topLocations.length) + "+" },
      ],
      filters: { source: "transactions" },
    },
    {
      eyebrow: "Chapter 03",
      title: "Everyday Rhythm",
      body: `${a.totals.household.toLocaleString()} household entries track money moving in and out of daily life. Recorded income totals ₹${a.incomeVsExpense[0].value.toLocaleString()} against ₹${a.incomeVsExpense[1].value.toLocaleString()} of expense. The largest expense group is "${topHh.name}".`,
      stats: [
        { label: "Entries", value: a.totals.household.toLocaleString() },
        { label: "Top outflow", value: topHh.name },
        { label: "Income", value: "₹" + a.incomeVsExpense[0].value.toLocaleString() },
      ],
      filters: { source: "household" },
    },
    {
      eyebrow: "Chapter 04",
      title: "Recurring Patterns",
      body: `${connections.length} days contain activity from more than one stream. ${busiestMonth.month} is the densest month in the combined record with ${(busiestMonth.spotify + busiestMonth.transactions + busiestMonth.household).toLocaleString()} events. Each connection below is grouped by calendar day, not inferred behaviour.`,
      stats: [
        { label: "Linked days", value: String(connections.length) },
        { label: "Densest month", value: busiestMonth.month },
        { label: "Categories", value: String(a.categories) },
      ],
      filters: { month: busiestMonth.month },
    },
  ];
}
