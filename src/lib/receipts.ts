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

export type Connection = {
  id: string;
  day: string;
  items: Receipt[];
  reasons: string[];
};

let cachedConnections: Connection[] | null = null;

export function getConnections(): Connection[] {
  if (cachedConnections) return cachedConnections;
  const byDay = new Map<string, Receipt[]>();
  for (const r of records) {
    const day = r.timestamp.slice(0, 10);
    const list = byDay.get(day);
    if (list) list.push(r);
    else byDay.set(day, [r]);
  }

  const out: Connection[] = [];
  for (const [day, items] of byDay) {
    const sources = new Set(items.map((i) => i.source));
    if (sources.size < 2) continue;
    const picked: Receipt[] = [];
    for (const s of ["spotify", "transactions", "household"] as Source[]) {
      const first = items.find((i) => i.source === s);
      if (first) picked.push(first);
    }
    picked.sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
    const reasons = ["Same day", `${sources.size} different sources`];
    const spanMin =
      (new Date(picked[picked.length - 1]!.timestamp + "Z").getTime() -
        new Date(picked[0]!.timestamp + "Z").getTime()) /
      60000;
    if (spanMin <= 180) reasons.push(`Nearby time (within ${Math.max(1, Math.round(spanMin))} min)`);
    const cats = items.map((i) => i.category);
    const repeated = cats.find((c, i) => cats.indexOf(c) !== i);
    if (repeated) reasons.push(`Repeated category: ${repeated}`);
    if (sources.size === 3) reasons.push("All three streams active");
    out.push({ id: day, day, items: picked, reasons });
  }

  cachedConnections = out
    .sort((a, b) => b.reasons.length - a.reasons.length || (a.day < b.day ? 1 : -1))
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
