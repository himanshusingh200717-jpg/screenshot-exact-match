import type { CompanyTier } from "@/lib/companyData";

export const TIER_STYLES: Record<CompanyTier | "All", { badge: string; active: string }> = {
  All: { badge: "bg-secondary text-secondary-foreground", active: "bg-primary text-primary-foreground border-primary" },
  "Super Dream": { badge: "bg-super-dream/10 text-super-dream", active: "bg-super-dream text-primary-foreground border-super-dream" },
  Dream: { badge: "bg-dream/10 text-dream", active: "bg-dream text-primary-foreground border-dream" },
  Standard: { badge: "bg-standard/10 text-standard", active: "bg-standard text-primary-foreground border-standard" },
  Regular: { badge: "bg-regular/10 text-regular", active: "bg-regular text-primary-foreground border-regular" },
};
