// Single data-access module. Phase 2: replace SEED_COMPANIES reads with database queries here.
import { SEED_COMPANIES } from "@/data/seedCompanies";
import {
  normalizeCompanyProfile,
  normalizeCompanySummary,
  normalizeDashboardSkills,
  type CompanyProfile,
  type CompanySummary,
  type DashboardSkill,
} from "./companyData";

export const COLLEGE_NAME = "JSS UNIVERSITY NOIDA";
export const COLLEGE_SHORT = "JSS";

export function getCompanySummaries(): CompanySummary[] {
  return SEED_COMPANIES.map((c) => normalizeCompanySummary(c.short_json, c.company_id));
}

export function getCompanyProfile(id: number): CompanyProfile | null {
  const c = SEED_COMPANIES.find((x) => x.company_id === id);
  return c ? normalizeCompanyProfile(c.full_json, c.short_json) : null;
}

export function getCompanySkills(id: number): DashboardSkill[] {
  const c = SEED_COMPANIES.find((x) => x.company_id === id);
  return c ? normalizeDashboardSkills(c.skill_levels) : [];
}
