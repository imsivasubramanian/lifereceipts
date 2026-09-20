import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Shell } from "@/components/Shell";
import { ChartCard } from "@/components/ChartCard";
import { aggregates } from "@/lib/receipts";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights — LifeReceipts" },
      {
        name: "description",
        content: "Aggregated charts: records by source and category, activity over time, top artists, listening hours, spending and household flow.",
      },
      { property: "og:title", content: "Insights — LifeReceipts" },
      { property: "og:description", content: "Real aggregated values across all three datasets." },
    ],
  }),
  component: Insights,
});

const AXIS = { stroke: "oklch(0.68 0.015 265)", fontSize: 11 };
const tooltipStyle = {
  background: "oklch(0.2 0.014 265)",
  border: "1px solid oklch(0.3 0.015 265)",
  borderRadius: 8,
  color: "oklch(0.96 0.005 265)",
  fontSize: 12,
};
const PIE_COLORS = [
  "var(--spotify)",
  "var(--transactions)",
  "var(--household)",
  "var(--primary)",
  "var(--accent)",
];

function Insights() {
  const a = aggregates;
  const monthly = (a.monthly as any[]).map((m) => ({
    ...m,
    total: m.spotify + m.transactions + m.household,
  }));

  return (
    <Shell>
      <header className="mb-6">
        <p className="eyebrow">Insights</p>
        <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Aggregated patterns</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Every chart is computed from the full source files — Spotify figures use all
          {" " + a.totals.spotifyPlays.toLocaleString()} plays, not the sampled explorer set.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Records by source" subtitle="Explorer record counts per stream">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={a.bySource} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85}>
                {a.bySource.map((_: unknown, i: number) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Activity over time" subtitle="Records per month across all sources">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthly}>
              <CartesianGrid stroke="oklch(0.3 0.015 265)" vertical={false} />
              <XAxis dataKey="month" tick={AXIS} minTickGap={40} />
              <YAxis tick={AXIS} width={40} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="total" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top artists" subtitle="Plays across the full listening history">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={a.topArtists} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" tick={AXIS} />
              <YAxis type="category" dataKey="name" tick={AXIS} width={110} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="plays" fill="var(--spotify)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Listening by hour" subtitle="Plays grouped by hour of day (UTC)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={a.hours}>
              <CartesianGrid stroke="oklch(0.3 0.015 265)" vertical={false} />
              <XAxis dataKey="hour" tick={AXIS} interval={2} />
              <YAxis tick={AXIS} width={45} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="var(--accent)" radius={3} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Transaction categories" subtitle="Number of card transactions per category">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={a.txCategories} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" tick={AXIS} />
              <YAxis type="category" dataKey="name" tick={AXIS} width={110} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="var(--transactions)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Household income vs expense" subtitle="Total recorded amounts (INR)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={a.incomeVsExpense}>
              <CartesianGrid stroke="oklch(0.3 0.015 265)" vertical={false} />
              <XAxis dataKey="name" tick={AXIS} />
              <YAxis tick={AXIS} width={70} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={6}>
                {a.incomeVsExpense.map((_: unknown, i: number) => (
                  <Cell key={i} fill={i === 0 ? "var(--spotify)" : "var(--household)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Household spend by category" subtitle="Top expense categories (INR)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={a.householdCategories} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" tick={AXIS} />
              <YAxis type="category" dataKey="name" tick={AXIS} width={120} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="var(--household)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Where transactions happen" subtitle="Most frequent locations in the transaction data">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={a.topLocations} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" tick={AXIS} />
              <YAxis type="category" dataKey="name" tick={AXIS} width={120} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="var(--primary)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </Shell>
  );
}
