// Builds compact normalized JSON from the three raw datasets.
// Run: node scripts/prepare-data.mjs
import fs from "node:fs";
import path from "node:path";

const SRC = "/tmp/ds";
const OUT = path.resolve("src/data");
fs.mkdirSync(OUT, { recursive: true });

function parseCSV(text) {
  const rows = [];
  let row = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else q = false;
      } else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c === "\r") { /* skip */ }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift().map((h) => h.replace(/^\uFEFF/, "").trim());
  return rows.filter((r) => r.length > 1).map((r) => {
    const o = {};
    header.forEach((h, i) => (o[h] = (r[i] ?? "").trim()));
    return o;
  });
}

const read = (p) => parseCSV(fs.readFileSync(path.join(SRC, p), "utf8"));

// ---------- Spotify ----------
const spotify = read("spotify/spotify_history.csv");
const artistCount = new Map();
const hourCount = new Array(24).fill(0);
const monthCount = new Map();
let totalMs = 0, skipped = 0;

const spotifyRecords = [];
const SAMPLE_EVERY = 60; // ~5k records kept for the explorer
spotify.forEach((r, idx) => {
  const ts = r.ts?.replace(" ", "T");
  const d = new Date(ts + "Z");
  if (isNaN(d)) return;
  const ms = Number(r.ms_played) || 0;
  totalMs += ms;
  if (String(r.skipped).toUpperCase() === "TRUE") skipped++;
  artistCount.set(r.artist_name, (artistCount.get(r.artist_name) || 0) + 1);
  hourCount[d.getUTCHours()]++;
  const mk = ts.slice(0, 7);
  monthCount.set(mk, (monthCount.get(mk) || 0) + 1);
  if (idx % SAMPLE_EVERY === 0) {
    spotifyRecords.push({
      id: "sp-" + idx,
      source: "spotify",
      timestamp: ts,
      type: "listen",
      title: r.track_name,
      description: `${r.artist_name} — ${r.album_name}`,
      category: r.artist_name || "Unknown artist",
      amount: null,
      location: null,
      platform: r.platform || null,
      metadata: {
        artist: r.artist_name,
        album: r.album_name,
        minutes: +(ms / 60000).toFixed(1),
        shuffle: String(r.shuffle).toUpperCase() === "TRUE",
        skipped: String(r.skipped).toUpperCase() === "TRUE",
      },
    });
  }
});

// ---------- Household ----------
const household = read("household/Daily Household Transactions.csv");
const householdRecords = [];
household.forEach((r, i) => {
  const [dpart, tpart = "00:00:00"] = r.Date.split(" ");
  const [dd, mm, yyyy] = dpart.split("/");
  if (!yyyy) return;
  const ts = `${yyyy}-${mm}-${dd}T${tpart}`;
  if (isNaN(new Date(ts + "Z"))) return;
  householdRecords.push({
    id: "hh-" + i,
    source: "household",
    timestamp: ts,
    type: (r["Income/Expense"] || "Expense").toLowerCase(),
    title: r.Subcategory || r.Category || "Household entry",
    description: r.Note || "",
    category: r.Category || "Uncategorised",
    amount: Number(r.Amount) || 0,
    location: null,
    platform: r.Mode || null,
    metadata: { mode: r.Mode, currency: r.Currency, flow: r["Income/Expense"] },
  });
});

// ---------- India transactions ----------
const tx = read("transactions/Augmented_IndiaTransactMultiFacet2024.csv");
const txRecords = [];
tx.forEach((r, i) => {
  const d = new Date(r.trans_date_trans_time);
  if (isNaN(d)) return;
  const ts = d.toISOString().slice(0, 19);
  const merchant = (r.merchant || "merchant").replace(/^fraud_/, "");
  const loc = [r.city, r.state].filter(Boolean).join(", ");
  txRecords.push({
    id: "tx-" + i,
    source: "transactions",
    timestamp: ts,
    type: "purchase",
    title: merchant,
    description: r.category ? `Payment in ${r.category.replace(/_/g, " ")}` : "Card payment",
    category: (r.category || "uncategorised").replace(/_/g, " "),
    amount: Number(r.amt) || 0,
    location: loc || null,
    platform: "Card",
    metadata: { flagged: r.is_fraud === "1" || r.is_fraud === "1.0" },
  });
});

const records = [...spotifyRecords, ...householdRecords, ...txRecords].sort((a, b) =>
  a.timestamp < b.timestamp ? -1 : 1,
);

const topArtists = [...artistCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
  .map(([name, plays]) => ({ name, plays }));

const monthly = {};
const bump = (src, key) => {
  monthly[key] = monthly[key] || { month: key, spotify: 0, transactions: 0, household: 0 };
  monthly[key][src]++;
};
monthCount.forEach((v, k) => {
  monthly[k] = monthly[k] || { month: k, spotify: 0, transactions: 0, household: 0 };
  monthly[k].spotify = v;
});
[...householdRecords, ...txRecords].forEach((r) => bump(r.source, r.timestamp.slice(0, 7)));

const tally = (arr, key) => {
  const m = new Map();
  arr.forEach((r) => m.set(r[key], (m.get(r[key]) || 0) + 1));
  return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
};
const sumBy = (arr, key) => {
  const m = new Map();
  arr.forEach((r) => m.set(r[key], (m.get(r[key]) || 0) + (r.amount || 0)));
  return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value: Math.round(value) }));
};

const hhIncome = householdRecords.filter((r) => r.type === "income");
const hhExpense = householdRecords.filter((r) => r.type !== "income");

const aggregates = {
  totals: {
    spotifyPlays: spotify.length,
    spotifySampled: spotifyRecords.length,
    transactions: txRecords.length,
    household: householdRecords.length,
    records: records.length,
    listeningHours: Math.round(totalMs / 3600000),
    skipRate: +((skipped / spotify.length) * 100).toFixed(1),
  },
  topArtists,
  hours: hourCount.map((count, hour) => ({ hour: `${String(hour).padStart(2, "0")}h`, count })),
  monthly: Object.values(monthly).sort((a, b) => (a.month < b.month ? -1 : 1)),
  txCategories: tally(txRecords, "category").slice(0, 10),
  txCategorySpend: sumBy(txRecords, "category").slice(0, 10),
  householdCategories: sumBy(hhExpense, "category").slice(0, 10),
  incomeVsExpense: [
    { name: "Income", value: Math.round(hhIncome.reduce((s, r) => s + r.amount, 0)) },
    { name: "Expense", value: Math.round(hhExpense.reduce((s, r) => s + r.amount, 0)) },
  ],
  bySource: [
    { name: "Spotify (sampled)", value: spotifyRecords.length },
    { name: "Transactions", value: txRecords.length },
    { name: "Household", value: householdRecords.length },
  ],
  topLocations: tally(txRecords.filter((r) => r.location), "location").slice(0, 12),
  dateSpan: { start: records[0].timestamp.slice(0, 10), end: records[records.length - 1].timestamp.slice(0, 10) },
  categories: new Set([...records.map((r) => r.category)]).size,
};

fs.writeFileSync(path.join(OUT, "records.json"), JSON.stringify(records));
fs.writeFileSync(path.join(OUT, "aggregates.json"), JSON.stringify(aggregates, null, 1));
console.log("records", records.length, "size", (fs.statSync(path.join(OUT, "records.json")).size / 1e6).toFixed(1) + "MB");
