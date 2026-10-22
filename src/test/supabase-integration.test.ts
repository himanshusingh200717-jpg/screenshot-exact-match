import { describe, expect, it, vi } from "vitest";
import {
  fetchCompanies,
  fetchCompanyProfile,
  fetchCompanySkills,
} from "@/lib/companyApi";
import { supabase } from "@/lib/supabaseClient";

describe("Phase 2 Supabase Data Access", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "example-anon-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });
  it("queries only public.company_json for fetchCompanies and normalizes cards", async () => {
    const mockCompanies = [
      {
        company_id: 1,
        short_json: {
          name: "Accenture plc",
          short_name: "Accenture",
          company_type: "Dream",
          category: "Enterprise",
          headquarters_address: "Dublin, Ireland",
        },
      },
    ];

    const selectMock = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: mockCompanies, error: null }),
    });

    const fromSpy = vi.spyOn(supabase, "from").mockReturnValue({
      select: selectMock,
    } as any);

    // Mock configured state temporarily
    const api = await import("@/lib/companyApi");
    const result = await fetchCompanies();

    expect(fromSpy).toHaveBeenCalledWith("company_json");
    expect(selectMock).toHaveBeenCalledWith("company_id, short_json");
    expect(result[0].companyId).toBe(1);
    expect(result[0].name).toBe("Accenture plc");
    expect(result[0].companyType).toBe("Dream");

    fromSpy.mockRestore();
  });

  it("queries only public.company_json for fetchCompanyProfile and filters out CTC/stipend/selection_ratio", async () => {
    const mockRow = {
      company_id: 1,
      short_json: {
        name: "Accenture plc",
        short_name: "Accenture",
        category: "Enterprise",
      },
      full_json: {
        name: "Accenture plc",
        website_url: "https://www.accenture.com",
        ctc: "20 LPA",
        stipend: "40k/month",
        selection_ratio: "2%",
      },
    };

    const maybeSingleMock = vi.fn().mockResolvedValue({ data: mockRow, error: null });
    const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock });

    const fromSpy = vi.spyOn(supabase, "from").mockReturnValue({
      select: selectMock,
    } as any);

    const profile = await fetchCompanyProfile(1);

    expect(fromSpy).toHaveBeenCalledWith("company_json");
    expect(selectMock).toHaveBeenCalledWith("company_id, short_json, full_json");
    expect(eqMock).toHaveBeenCalledWith("company_id", 1);
    expect(profile).not.toBeNull();
    expect(profile?.name).toBe("Accenture plc");
    expect((profile as any)?.ctc).toBeUndefined();
    expect((profile as any)?.stipend).toBeUndefined();
    expect((profile as any)?.selection_ratio).toBeUndefined();

    fromSpy.mockRestore();
  });

  it("queries the 4 skill tables and builds skill cards + topic roadmaps", async () => {
    const mockSkillLevels = [
      {
        company_id: 1,
        skill_set_id: 1,
        required_level: 8,
        required_proficiency_level_id: 5,
      },
    ];

    const mockSkillMaster = [
      {
        skill_set_id: 1,
        skill_set_name: "Data Structures & Algorithms",
        short_name: "DSA",
      },
    ];

    const mockProficiencyLevels = [
      {
        proficiency_level_id: 5,
        proficiency_name: "Expert",
        proficiency_code: "EXP",
      },
    ];

    const mockTopics = [
      { skill_set_id: 1, level_number: 1, topics: "Arrays & Strings" },
      { skill_set_id: 1, level_number: 2, topics: "Recursion" },
    ];

    const queriedTables: string[] = [];

    const fromSpy = vi.spyOn(supabase, "from").mockImplementation((tableName: string) => {
      queriedTables.push(tableName);
      if (tableName === "company_skill_levels") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: mockSkillLevels, error: null }),
          }),
        } as any;
      }
      if (tableName === "skill_set_master") {
        return {
          select: vi.fn().mockResolvedValue({ data: mockSkillMaster, error: null }),
        } as any;
      }
      if (tableName === "proficiency_levels") {
        return {
          select: vi.fn().mockResolvedValue({ data: mockProficiencyLevels, error: null }),
        } as any;
      }
      if (tableName === "skill_set_topics") {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockTopics, error: null }),
          }),
        } as any;
      }
      return {} as any;
    });

    const result = await fetchCompanySkills(1);

    expect(queriedTables).toContain("company_skill_levels");
    expect(queriedTables).toContain("skill_set_master");
    expect(queriedTables).toContain("proficiency_levels");
    expect(queriedTables).toContain("skill_set_topics");

    expect(result.skills.length).toBe(1);
    expect(result.skills[0].name).toBe("Data Structures & Algorithms");
    expect(result.skills[0].score).toBe(8);
    expect(result.skills[0].proficiency).toBe("Expert");
    expect(result.skills[0].difficulty).toBe("EXPERT");
    expect(result.topics[1]).toEqual(["Arrays & Strings", "Recursion"]);

    fromSpy.mockRestore();
  });
});
