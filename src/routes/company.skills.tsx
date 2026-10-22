import { createFileRoute } from "@tanstack/react-router";
import { memo, useState } from "react";
import { ChevronDown, Lock, CheckCircle2, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/components/CompanyLogo";
import { useRequiredCompany } from "@/hooks/use-selected-company";
import { useCompanyProfile, useCompanySkills } from "@/lib/companyApi";
import { proficiencyToBloom, scoreToCriticality, type BloomLevel, type Criticality, type DashboardSkill } from "@/lib/companyData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/company/skills")({
  head: () => ({
    meta: [
      { title: "Skill Intelligence · JSS Placement Hub" },
      { name: "description", content: "Required skills, Bloom levels and 10-level learning roadmaps for a recruiting company." },
      { property: "og:title", content: "Skill Intelligence · JSS Placement Hub" },
      { property: "og:description", content: "Know exactly which skills to build and how deep." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SkillIntelligence,
});

const BLOOM: Record<BloomLevel, { label: string; range: string; tint: string; bar: string; text: string }> = {
  CU: { label: "Conceptual Understanding", range: "1–2", tint: "bg-bloom-cu/10 border-bloom-cu/30", bar: "bg-bloom-cu", text: "text-bloom-cu" },
  AP: { label: "Application", range: "3–4", tint: "bg-bloom-ap/10 border-bloom-ap/30", bar: "bg-bloom-ap", text: "text-bloom-ap" },
  AS: { label: "Analysis", range: "5–6", tint: "bg-bloom-as/10 border-bloom-as/30", bar: "bg-bloom-as", text: "text-bloom-as" },
  EV: { label: "Evaluation", range: "7–8", tint: "bg-bloom-ev/10 border-bloom-ev/30", bar: "bg-bloom-ev", text: "text-bloom-ev" },
  CR: { label: "Creation", range: "9–10", tint: "bg-bloom-cr/10 border-bloom-cr/30", bar: "bg-bloom-cr", text: "text-bloom-cr" },
};
const CRIT: Record<Criticality, { desc: string; text: string }> = {
  Critical: { desc: "Score 7+ · must-have for selection", text: "text-expert" },
  Important: { desc: "Score 5–6 · strongly preferred", text: "text-advanced" },
  Baseline: { desc: "Below 5 · good foundation", text: "text-beginner" },
};

const SkillCard = memo(function SkillCard({ skill, topics = [] }: { skill: DashboardSkill; topics?: string[] }) {
  const [open, setOpen] = useState(false);
  const bloom = BLOOM[proficiencyToBloom(skill.score)];
  const crit = scoreToCriticality(skill.score);
  return (
    <div className="rounded-xl border bg-card">
      <button onClick={() => setOpen((o) => !o)} className="w-full p-4 text-left" aria-expanded={open}>
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{skill.name}</h3>
              <span className={cn("rounded-md border px-1.5 py-0.5 text-xs font-semibold", bloom.tint, bloom.text)}>{proficiencyToBloom(skill.score)}</span>
            </div>
            <p className={cn("mt-1 text-xs font-medium", CRIT[crit].text)}>{crit} · {skill.proficiency}</p>
          </div>
          <span className="font-heading text-lg font-semibold">{skill.score}<span className="text-sm text-muted-foreground">/10</span></span>
          <ChevronDown className={cn("mt-1 h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div className={cn("h-full rounded-full", bloom.bar)} style={{ width: `${skill.score * 10}%` }} />
        </div>
      </button>
      {open && (
        <ol className="border-t px-4 py-3">
          {topics.map((t, i) => {
            const lvl = i + 1;
            const locked = lvl > skill.score;
            return (
              <li key={lvl} className={cn("flex items-center gap-3 py-1.5 text-sm", locked && "text-muted-foreground")}>
                <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold", locked ? "bg-muted" : cn(BLOOM[proficiencyToBloom(lvl)].tint, BLOOM[proficiencyToBloom(lvl)].text))}>{lvl}</span>
                <span className="flex-1">{t}</span>
                {locked ? (
                  <span className="flex items-center gap-1 text-xs"><Lock className="h-3.5 w-3.5" />Beyond scope</span>
                ) : lvl === skill.score ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-link"><Target className="h-3.5 w-3.5" />Target</span>
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-standard" />
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
});

function SkillIntelligence() {
  const selected = useRequiredCompany();
  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    refetch: refetchProfile,
  } = useCompanyProfile(selected?.companyId);

  const {
    data: skillsData,
    isLoading: isSkillsLoading,
    isError: isSkillsError,
    refetch: refetchSkills,
  } = useCompanySkills(selected?.companyId);

  const isLoading = !selected || isProfileLoading || isSkillsLoading;
  const isError = isProfileError || isSkillsError;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-4 sm:p-6">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }
  if (isError || !profile) {
    return (
      <div className="mx-auto my-16 max-w-md rounded-xl border border-dashed bg-background p-8 text-center">
        <p className="font-heading text-lg font-semibold">Failed to load skill intelligence</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Could not fetch skill data from Supabase. Ensure your Supabase credentials in .env are valid.
        </p>
        <Button
          className="mt-4"
          onClick={() => {
            refetchProfile();
            refetchSkills();
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  const skills = skillsData?.skills ?? [];
  const topicsMap = skillsData?.topics ?? {};

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <CompanyLogo name={profile.name} logoUrl={profile["logo_url"] ?? ""} websiteUrl={profile.website_url} />
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">{profile.short_name || profile.name} Skill Intelligence</h1>
          <p className="text-sm text-muted-foreground">{skills.length} skills · tap a skill to see its 10-level roadmap</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {(Object.keys(BLOOM) as BloomLevel[]).map((k) => (
          <div key={k} className={cn("rounded-lg border p-3", BLOOM[k].tint)}>
            <p className={cn("font-heading text-sm font-semibold", BLOOM[k].text)}>{k} · {BLOOM[k].range}</p>
            <p className="text-xs text-muted-foreground">{BLOOM[k].label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {(Object.keys(CRIT) as Criticality[]).map((k) => (
          <div key={k} className="rounded-lg border bg-card p-3">
            <p className={cn("text-sm font-semibold", CRIT[k].text)}>{k}</p>
            <p className="text-xs text-muted-foreground">{CRIT[k].desc}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {skills.map((s) => (
          <SkillCard key={s.id} skill={s} topics={s.topics ?? topicsMap[s.id] ?? []} />
        ))}
      </div>
    </div>
  );
}
