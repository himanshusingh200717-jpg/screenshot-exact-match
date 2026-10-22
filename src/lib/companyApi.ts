import { useQuery } from "@tanstack/react-query";
import { supabase, checkIsSupabaseConfigured } from "./supabaseClient";
import {
  normalizeCompanyProfile,
  normalizeCompanySummary,
  normalizeDashboardSkills,
  asString,
  type CompanyProfile,
  type CompanySummary,
  type DashboardSkill,
} from "./companyData";

export interface CompanySkillsData {
  skills: (DashboardSkill & { topics: string[] })[];
  topics: Record<number, string[]>;
}

function formatTopics(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(asString).filter(Boolean).join("; ");
  }

  if (typeof value === "string" && value.trim().startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(asString).filter(Boolean).join("; ");
      }
    } catch {
      // Keep the original value when it is not serialized JSON.
    }
  }

  return asString(value);
}

/**
 * Fetch all companies for listing / cards.
 * Reads ONLY from public.company_json (company_id, short_json).
 */
export async function fetchCompanies(): Promise<CompanySummary[]> {
  if (!checkIsSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.",
    );
  }

  const { data, error } = await supabase
    .from("company_json")
    .select("company_id, short_json")
    .order("company_id", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => normalizeCompanySummary(row.short_json, Number(row.company_id)));
}

/**
 * Fetch a single company profile with all 22 intelligence sections.
 * Reads ONLY from public.company_json (company_id, short_json, full_json).
 */
export async function fetchCompanyProfile(companyId: number): Promise<CompanyProfile | null> {
  if (!checkIsSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.",
    );
  }

  const { data, error } = await supabase
    .from("company_json")
    .select("company_id, short_json, full_json")
    .eq("company_id", companyId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) return null;

  return normalizeCompanyProfile(data.full_json, data.short_json);
}

/**
 * Fetch company skill levels and 10-level roadmaps.
 * Queries ONLY 4 tables:
 * - company_skill_levels
 * - skill_set_master
 * - proficiency_levels
 * - skill_set_topics
 */
export async function fetchCompanySkills(companyId: number): Promise<CompanySkillsData> {
  if (!checkIsSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.",
    );
  }

  const [cslRes, ssmRes, plRes, sstRes] = await Promise.all([
    supabase
      .from("company_skill_levels")
      .select("company_id, skill_set_id, required_level, required_proficiency_level_id")
      .eq("company_id", companyId),
    supabase.from("skill_set_master").select("skill_set_id, skill_set_name, short_name"),
    supabase
      .from("proficiency_levels")
      .select("proficiency_level_id, proficiency_name, proficiency_code"),
    supabase
      .from("skill_set_topics")
      .select("skill_set_id, level_number, topics")
      .order("level_number", { ascending: true }),
  ]);

  if (cslRes.error) throw cslRes.error;
  if (ssmRes.error) throw ssmRes.error;
  if (plRes.error) throw plRes.error;
  if (sstRes.error) throw sstRes.error;

  const skillNameMap = new Map<number, string>();
  for (const row of ssmRes.data ?? []) {
    const name =
      asString(row.skill_set_name) || asString(row.short_name) || `Skill ${row.skill_set_id}`;
    skillNameMap.set(Number(row.skill_set_id), name);
  }

  const profMap = new Map<number, string>();
  for (const row of plRes.data ?? []) {
    const name = asString(row.proficiency_name) || asString(row.proficiency_code) || "Proficient";
    profMap.set(Number(row.proficiency_level_id), name);
  }

  const topicsBySkillId: Record<number, string[]> = {};
  for (const row of sstRes.data ?? []) {
    const sId = Number(row.skill_set_id);
    if (!topicsBySkillId[sId]) {
      topicsBySkillId[sId] = [];
    }
    const topicText = formatTopics(row.topics);
    if (topicText) {
      topicsBySkillId[sId].push(topicText);
    }
  }

  const rawSkillLevels = (cslRes.data ?? []).map((row) => {
    const sId = Number(row.skill_set_id);
    const pId = Number(row.required_proficiency_level_id);
    return {
      skill_set_id: sId,
      skill_set_name: skillNameMap.get(sId) ?? `Skill ${sId}`,
      required_level: Number(row.required_level) || 0,
      required_proficiency: profMap.get(pId) ?? "Proficient",
    };
  });

  const normalized = normalizeDashboardSkills(rawSkillLevels);
  const skillsWithTopics = normalized.map((skill) => ({
    ...skill,
    topics: topicsBySkillId[skill.id] ?? [],
  }));

  return {
    skills: skillsWithTopics,
    topics: topicsBySkillId,
  };
}

// React Query hooks

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
  });
}

export function useCompanyProfile(companyId?: number | null) {
  return useQuery({
    queryKey: ["company-profile", companyId],
    queryFn: () => (companyId ? fetchCompanyProfile(companyId) : null),
    enabled: typeof companyId === "number" && companyId > 0,
  });
}

export function useCompanySkills(companyId?: number | null) {
  return useQuery({
    queryKey: ["company-skills", companyId],
    queryFn: () => (companyId ? fetchCompanySkills(companyId) : { skills: [], topics: {} }),
    enabled: typeof companyId === "number" && companyId > 0,
  });
}
