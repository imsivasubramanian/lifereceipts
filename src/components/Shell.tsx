import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, Receipt, X } from "lucide-react";

const NAV = [
  { to: "/", label: "Overview" },
  { to: "/explore", label: "Explore" },
  { to: "/connections", label: "Connections" },
  { to: "/story", label: "Story" },
  { to: "/insights", label: "Insights" },
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <Receipt className="h-5 w-5 text-primary" aria-hidden="true" />
            <span className="font-display text-lg font-semibold tracking-tight">LifeReceipts</span>
          </Link>
          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    activeOptions={{ exact: n.to === "/" }}
                    activeProps={{ className: "bg-secondary text-foreground" }}
                    className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <button
            type="button"
            className="rounded-md border border-border p-2 md:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <nav aria-label="Mobile" className="border-t border-border md:hidden">
            <ul className="mx-auto max-w-6xl px-4 py-2">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    activeOptions={{ exact: n.to === "/" }}
                    activeProps={{ className: "text-primary" }}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-2 py-3 text-sm text-muted-foreground"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">{children}</main>
      <footer className="border-t border-border/70 py-8 text-center text-xs text-muted-foreground">
        LifeReceipts — Small moments. Hidden patterns. One story.
      </footer>
    </div>
  );
}
