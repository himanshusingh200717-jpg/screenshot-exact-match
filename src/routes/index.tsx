import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { CompanyCard } from "@/components/CompanyCard";
import { TIER_STYLES } from "@/components/tiers";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { COLLEGE_NAME, COLLEGE_SHORT } from "@/lib/college";
import { useCompanies } from "@/lib/companyApi";
import { COMPANY_TIERS, type CompanySummary, type CompanyTier } from "@/lib/companyData";
import { useCompany } from "@/context/CompanyContext";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${COLLEGE_SHORT} Companies Research & Placement Analytics Portal` },
      { name: "description", content: "Search recruiting companies, explore deep company intelligence and required skills for campus placements." },
      { property: "og:title", content: `${COLLEGE_SHORT} Placement Intelligence Hub` },
      { property: "og:description", content: "Your strategic edge for campus placements." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Filter = CompanyTier | "All";

function Index() {
  const navigate = useNavigate();
  const { selectCompany, ready } = useCompany();
  const { data: companies = [], isLoading, isError, refetch } = useCompanies();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [query]);

  const searched = useMemo(
    () => companies.filter((c) => !debounced || `${c.name} ${c.shortName} ${c.category} ${c.headquarters}`.toLowerCase().includes(debounced)),
    [companies, debounced],
  );
  const counts = useMemo(() => {
    const m: Record<Filter, number> = { All: searched.length, "Super Dream": 0, Dream: 0, Standard: 0, Regular: 0 };
    searched.forEach((c) => m[c.companyType]++);
    return m;
  }, [searched]);
  const visible = filter === "All" ? searched : searched.filter((c) => c.companyType === filter);

  const onSelect = useCallback(
    (c: CompanySummary) => {
      selectCompany({ companyId: c.companyId, companyName: c.name, logoUrl: c.logoUrl });
      navigate({ to: "/company/intelligence" });
    },
    [navigate, selectCompany],
  );

  const reset = () => { setQuery(""); setDebounced(""); setFilter("All"); };

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
          <span className="inline-flex rounded-full border bg-link-soft px-3 py-1 text-xs font-medium tracking-wide text-link">
            {COLLEGE_SHORT} · INTELLIGENCE PLATFORM
          </span>
          <h1 className="mt-4 max-w-3xl text-2xl font-semibold tracking-tight sm:text-4xl">
            {COLLEGE_NAME} Companies Research & Placement Analytics Portal
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">Your strategic edge for campus placements</p>
          <div className="relative mt-6 max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search companies, industries, locations…"
              aria-label="Search companies"
              className="h-11 w-full rounded-lg border bg-background pl-9 pr-10 text-sm outline-none focus:border-link focus:ring-2 focus:ring-ring/20"
            />
            {query && (
              <button aria-label="Clear search" onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {(["All", ...COMPANY_TIERS] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                filter === f ? TIER_STYLES[f].active : "bg-background hover:bg-muted",
              )}
            >
              {f}
              <span className={cn("rounded-full px-1.5 text-xs", filter === f ? "bg-background/20" : TIER_STYLES[f].badge)}>{counts[f]}</span>
            </button>
          ))}
        </div>

        {isError && (
          <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed bg-background py-16 text-center">
            <p className="font-heading text-lg font-semibold">Failed to load companies</p>
            <p className="mt-1 text-sm text-muted-foreground">Could not fetch data from Supabase. Ensure your Supabase credentials in .env are valid.</p>
            <Button className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        )}

        {!isError && (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {!ready || isLoading
              ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)
              : visible.map((c) => <CompanyCard key={c.companyId} company={c} onSelect={onSelect} />)}
          </div>
        )}

        {!isError && ready && !isLoading && visible.length === 0 && (
          <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed bg-background py-16 text-center">
            <p className="font-heading text-lg font-semibold">No companies match</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different search or category.</p>
            <Button variant="outline" className="mt-4" onClick={reset}>Reset filters</Button>
          </div>
        )}
      </main>
    </div>
  );
}
