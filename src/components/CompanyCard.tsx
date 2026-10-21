import { memo } from "react";
import { ArrowRight, MapPin, TrendingDown, TrendingUp, Users } from "lucide-react";
import type { CompanySummary } from "@/lib/companyData";
import { isNullish } from "@/lib/companyData";
import { CompanyLogo } from "./CompanyLogo";
import { TIER_STYLES } from "./tiers";
import { cn } from "@/lib/utils";

function Val({ v }: { v: string }) {
  return isNullish(v) ? <span className="italic text-muted-foreground">not publicly available</span> : <span className="truncate">{v}</span>;
}

export const CompanyCard = memo(function CompanyCard({ company, onSelect }: { company: CompanySummary; onSelect: (c: CompanySummary) => void }) {
  const down = company.yoyGrowthRate.trim().startsWith("-");
  return (
    <button
      type="button"
      onClick={() => onSelect(company)}
      className="group relative flex flex-col gap-3 rounded-xl border bg-card p-4 text-left transition-colors hover:border-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-2">
        <CompanyLogo name={company.name} logoUrl={company.logoUrl} websiteUrl={company.websiteUrl} />
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", TIER_STYLES[company.companyType].badge)}>{company.companyType}</span>
      </div>
      <div>
        <h3 className="text-base font-semibold leading-tight">{company.name}</h3>
        <p className="text-sm text-muted-foreground">{company.shortName}</p>
      </div>
      <div className="space-y-1.5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" /><Val v={company.headquarters} /></div>
        <div className="flex items-center gap-2"><Users className="h-4 w-4 shrink-0" /><Val v={company.employeeSize} /></div>
        <div className={cn("flex items-center gap-2", down ? "text-destructive" : "text-standard")}>
          {down ? <TrendingDown className="h-4 w-4 shrink-0" /> : <TrendingUp className="h-4 w-4 shrink-0" />}
          {isNullish(company.yoyGrowthRate) ? <Val v="" /> : <span>{company.yoyGrowthRate} YoY</span>}
        </div>
      </div>
      <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-link" />
    </button>
  );
});
