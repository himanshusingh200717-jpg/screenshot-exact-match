import { describe, expect, it } from "vitest";
import { normalizeCompanyProfile, proficiencyToBloom, scoreToCriticality, scoreToDifficulty } from "@/lib/companyData";

describe("skill rules", () => {
  it("maps levels to Bloom", () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(proficiencyToBloom)).toEqual(["CU", "CU", "AP", "AP", "AS", "AS", "EV", "EV", "CR", "CR"]);
  });
  it("maps score to criticality", () => {
    expect([7, 6, 5, 4].map(scoreToCriticality)).toEqual(["Critical", "Important", "Important", "Baseline"]);
  });
  it("maps score to difficulty", () => {
    expect([8, 6, 4, 3].map(scoreToDifficulty)).toEqual(["EXPERT", "ADVANCED", "PRO", "BEGINNER"]);
  });
  it("never exposes CTC, stipend or selection ratio", () => {
    const p = normalizeCompanyProfile({ ctc: "10L", stipend: "50k", selection_ratio: "5%", name: "X" }, {});
    expect(Object.keys(p)).toEqual(["name"]);
  });
});
