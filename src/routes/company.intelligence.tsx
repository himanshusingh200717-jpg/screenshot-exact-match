import { createFileRoute } from "@tanstack/react-router";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Globe, Linkedin, PlayCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyLogo } from "@/components/CompanyLogo";
import { useRequiredCompany } from "@/hooks/use-selected-company";
import { getCompanyProfile } from "@/lib/companies";
import { isNullish, splitItems } from "@/lib/companyData";
import { buildIntelligenceSections, type IntelField, type IntelSection } from "@/data/intelligenceData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/company/intelligence")({
  head: () => ({
    meta: [
      { title: "Company Intelligence · JSS Placement Hub" },
      { name: "description", content: "22-section deep dive into a recruiting company: leadership, financials, tech, culture and more." },
      { property: "og:title", content: "Company Intelligence · JSS Placement Hub" },
      { property: "og:description", content: "Deep company research for campus placements." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CompanyIntelligence,
});

function Pill({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <span className={cn("inline-flex rounded-md border px-2 py-0.5 text-xs", muted ? "bg-muted text-muted-foreground" : "bg-secondary text-secondary-foreground")}>
      {children}
    </span>
  );
}

function renderValue(f: IntelField) {
  const v = f.value ?? "";
  if (isNullish(v)) return <Pill muted>Not Available</Pill>;
  if (f.type === "url" || f.type === "video" || /^https?:\/\//.test(v)) {
    const Icon = f.type === "video" ? PlayCircle : ExternalLink;
    return (
      <a href={v} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 break-all text-link hover:underline">
        <Icon className="h-4 w-4 shrink-0" />{v.replace(/^https?:\/\/(www\.)?/, "")}
      </a>
    );
  }
  if (f.type === "rating") {
    const n = parseFloat(v);
    return (
      <span className="inline-flex items-center gap-1.5 font-medium">
        <Star className="h-4 w-4 fill-bloom-as text-bloom-as" />{Number.isFinite(n) ? v : v}
      </span>
    );
  }
  if (f.type === "paragraph") return <p className="leading-relaxed">{v}</p>;
  const items = v.includes(";") ? splitItems(v) : v.length < 140 && v.split(",").length > 2 ? v.split(",").map((s) => s.trim()) : null;
  if (items && items.length > 1) return <div className="flex flex-wrap gap-1.5">{items.map((i) => <Pill key={i}>{i}</Pill>)}</div>;
  return <span>{v}</span>;
}

const FieldRow = memo(function FieldRow({ f }: { f: IntelField }) {
  return (
    <div className="flex flex-col gap-1 border-b py-3 last:border-0 sm:flex-row sm:gap-4">
      <dt className="text-sm text-muted-foreground sm:w-1/3">{f.label}</dt>
      <dd className="text-sm sm:w-2/3">{renderValue(f)}</dd>
    </div>
  );
});

const SectionCard = memo(function SectionCard({ s, idx }: { s: IntelSection; idx: number }) {
  const filled = s.fields.filter((f) => !isNullish(f.value)).length;
  return (
    <section id={s.id} data-idx={idx} className="scroll-mt-32 rounded-xl border bg-card">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-link-soft text-link"><s.icon className="h-4 w-4" /></div>
        <h2 className="flex-1 text-base font-semibold">{s.title}</h2>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{filled}/{s.fields.length}</span>
      </div>
      <dl className="px-4">{s.fields.map((f) => <FieldRow key={f.key} f={f} />)}</dl>
    </section>
  );
});

function CompanyIntelligence() {
  const selected = useRequiredCompany();
  const profile = useMemo(() => (selected ? getCompanyProfile(selected.companyId) : null), [selected]);
  const sections = useMemo(() => buildIntelligenceSections(profile ?? undefined), [profile]);
  const [active, setActive] = useState(0);
  const isScrollingRef = useRef(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    tabRefs.current[active]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [active]);

  useEffect(() => {
    if (!profile) return;
    const onScroll = () => {
      if (isScrollingRef.current) return;
      const els = sections.map((s) => document.getElementById(s.id));
      let cur = 0;
      els.forEach((el, i) => { if (el && el.getBoundingClientRect().top <= 160) cur = i; });
      setActive(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [profile, sections]);

  const scrollToSection = useCallback((idx: number) => {
    const sec = sections[idx]; const el = sec ? document.getElementById(sec.id) : null;
    if (!el) return;
    isScrollingRef.current = true;
    setActive(idx);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => { isScrollingRef.current = false; }, 800);
  }, [sections]);

  if (!selected || !profile) {
    return <div className="space-y-4 p-4"><Skeleton className="h-16" /><Skeleton className="h-10" /><Skeleton className="h-64" /></div>;
  }

  return (
    <div>
      <div className="sticky top-12 z-20 border-b bg-background">
        <div className="flex items-center gap-3 px-4 py-3">
          <CompanyLogo name={profile.name} logoUrl={profile["logo_url"] ?? ""} websiteUrl={profile.website_url} className="h-10 w-10" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold">{profile.name}</h1>
            {!isNullish(profile.category) && <span className="rounded-full bg-link-soft px-2 py-0.5 text-xs font-medium text-link">{profile.category}</span>}
          </div>
          {!isNullish(profile.website_url) && (
            <Button asChild variant="outline" size="sm"><a href={profile.website_url} target="_blank" rel="noreferrer"><Globe /><span className="hidden sm:inline">Website</span></a></Button>
          )}
          {!isNullish(profile.linkedin_url) && (
            <Button asChild variant="outline" size="sm"><a href={profile.linkedin_url} target="_blank" rel="noreferrer"><Linkedin /><span className="hidden sm:inline">LinkedIn</span></a></Button>
          )}
        </div>
        <div className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2">
          {sections.map((s, i) => (
            <button
              key={s.id}
              ref={(el) => { tabRefs.current[i] = el; }}
              onClick={() => scrollToSection(i)}
              className={cn("shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors", i === active ? "bg-link-soft font-medium text-link" : "text-muted-foreground hover:bg-muted")}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-5xl space-y-4 p-4 sm:p-6">
        {sections.map((s, i) => <SectionCard key={s.id} s={s} idx={i} />)}
      </div>
    </div>
  );
}
