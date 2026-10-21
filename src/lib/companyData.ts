// Pure normalizers. Inputs are raw JSON shapes (short_json / full_json / skill_levels)
// so Phase 2 can pass database rows through untouched.

export type CompanyTier = "Super Dream" | "Dream" | "Standard" | "Regular";
export const COMPANY_TIERS: CompanyTier[] = ["Super Dream", "Dream", "Standard", "Regular"];

export interface CompanySummary {
  companyId: number;
  name: string;
  shortName: string;
  logoUrl: string;
  category: string;
  companyType: CompanyTier;
  incorporationYear: string;
  employeeSize: string;
  headquarters: string;
  operatingCountries: string;
  officeLocations: string;
  yoyGrowthRate: string;
  websiteUrl: string;
}

/** All profile fields as strings, keyed by their raw JSON key (163 fields). */
export type CompanyProfile = Record<string, string> & {
  name: string;
  short_name: string;
  website_url: string;
  linkedin_url: string;
  category: string;
};

export interface DashboardSkill {
  id: number;
  name: string;
  score: number;
  proficiency: string;
  difficulty: "EXPERT" | "ADVANCED" | "PRO" | "BEGINNER";
}

// Never shown anywhere in the platform.
const BLOCKED_KEYS = /(ctc|stipend|selection_ratio)/i;

export function asString(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (Array.isArray(v)) return v.map(asString).join("; ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v).trim();
}

export function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

export function splitItems(v: string): string[] {
  return v
    .split(/\n|;|•|\u2022|\.(?=\s+[A-Z])/)
    .map((s) => s.replace(/^[-*\s]+/, "").trim())
    .filter(Boolean);
}

export function titleCaseFromCode(code: string): string {
  return code
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => (w.length <= 3 && /^(tam|sam|som|ceo|esg|ai|ml|cac|ltv|yoy|csr)$/i.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

export function scoreToDifficulty(score: number): DashboardSkill["difficulty"] {
  if (score >= 8) return "EXPERT";
  if (score >= 6) return "ADVANCED";
  if (score >= 4) return "PRO";
  return "BEGINNER";
}

export function isNullish(v: unknown): boolean {
  const s = asString(v).toLowerCase();
  return ["", "na", "n/a", "none", "-", "null", "undefined"].includes(s);
}

function toTier(v: unknown): CompanyTier {
  const s = asString(v).toLowerCase().replace(/[\s_-]/g, "");
  if (s === "superdream") return "Super Dream";
  if (s === "dream") return "Dream";
  if (s === "standard") return "Standard";
  return "Regular";
}

export function normalizeCompanySummary(short_json: unknown, companyId = 0): CompanySummary {
  const r = asRecord(short_json);
  return {
    companyId,
    name: asString(r["name"]),
    shortName: asString(r["short_name"]) || asString(r["name"]),
    logoUrl: asString(r["logo_url"]),
    category: asString(r["category"]),
    companyType: toTier(r["company_type"]),
    incorporationYear: asString(r["incorporation_year"]),
    employeeSize: asString(r["employee_size"]),
    headquarters: asString(r["headquarters_address"]),
    operatingCountries: asString(r["operating_countries"]),
    officeLocations: asString(r["office_locations"]),
    yoyGrowthRate: asString(r["yoy_growth_rate"]),
    websiteUrl: asString(r["website_url"]),
  };
}

export function normalizeCompanyProfile(full_json: unknown, short_json: unknown): CompanyProfile {
  const merged = { ...asRecord(short_json), ...asRecord(full_json) };
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(merged)) {
    if (BLOCKED_KEYS.test(k)) continue;
    out[k] = asString(v);
  }
  return out as CompanyProfile;
}

export function normalizeDashboardSkills(skillLevels: unknown): DashboardSkill[] {
  if (!Array.isArray(skillLevels)) return [];
  return skillLevels
    .map((raw) => {
      const r = asRecord(raw);
      const score = Math.max(0, Math.min(10, Number(r["required_level"]) || 0));
      return {
        id: Number(r["skill_set_id"]) || 0,
        name: asString(r["skill_set_name"]),
        score,
        proficiency: asString(r["required_proficiency"]),
        difficulty: scoreToDifficulty(score),
      };
    })
    .sort((a, b) => b.score - a.score);
}

export type BloomLevel = "CU" | "AP" | "AS" | "EV" | "CR";
export function proficiencyToBloom(level: number): BloomLevel {
  if (level <= 2) return "CU";
  if (level <= 4) return "AP";
  if (level <= 6) return "AS";
  if (level <= 8) return "EV";
  return "CR";
}

export type Criticality = "Critical" | "Important" | "Baseline";
export function scoreToCriticality(score: number): Criticality {
  if (score >= 7) return "Critical";
  if (score >= 5) return "Important";
  return "Baseline";
}

export function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
