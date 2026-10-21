import {
  Award, Briefcase, Building2, Car, Cpu, DollarSign, Eye, Gift, Globe, GraduationCap, Handshake,
  Leaf, Megaphone, Newspaper, Phone, PieChart, Shield, ShieldCheck, Star, Swords, Target, Users, type LucideIcon,
} from "lucide-react";
import type { CompanyProfile } from "@/lib/companyData";
import { titleCaseFromCode } from "@/lib/companyData";

export type FieldType = "auto" | "url" | "video" | "rating" | "list" | "paragraph";
export interface IntelField { key: string; label: string; type: FieldType; value?: string | undefined }
export interface IntelSection { id: string; title: string; icon: LucideIcon; fields: IntelField[] }

const P: FieldType = "paragraph";
const U: FieldType = "url";
const R: FieldType = "rating";

const SCHEMA: [string, LucideIcon, (string | [string, FieldType, string?])[]][] = [
  ["Company Identity", Building2, ["name", "short_name", "category", "nature_of_company", "incorporation_year", "employee_size", "headquarters_address"]],
  ["Overview & Vision", Eye, [["overview_text", P, "Overview"], ["vision_statement", P, "Vision"], ["mission_statement", P, "Mission"], "core_values", "history_timeline"]],
  ["Leadership", Users, ["ceo_name", ["ceo_linkedin_url", U, "CEO LinkedIn"], "key_leaders", "board_members", "warm_intro_pathways", "decision_maker_access"]],
  ["Funding & Financials", DollarSign, ["annual_revenue", "annual_profit", "revenue_mix", "valuation", ["yoy_growth_rate", "auto", "YoY Growth Rate"], "profitability_status", "key_investors", "recent_funding_rounds", "total_capital_raised", "burn_rate", "runway_months", "burn_multiplier"]],
  ["Global Presence", Globe, ["operating_countries", "office_count", "office_locations"]],
  ["Products & Services", Briefcase, ["offerings_description", "focus_sectors", "pain_points_addressed", "top_customers", "product_pipeline", "case_studies"]],
  ["Technology Stack", Cpu, ["tech_stack", "technology_partners", "intellectual_property", ["r_and_d_investment", "auto", "R&D Investment"], ["ai_ml_adoption_level", "auto", "AI/ML Adoption"], "cybersecurity_posture", "tech_adoption_rating", "innovation_roadmap"]],
  ["Partnerships & Ecosystem", Handshake, ["partnership_ecosystem", "industry_associations", "event_participation"]],
  ["Competitive Landscape", Swords, ["key_competitors", "market_share_percentage", "competitive_advantages", "unique_differentiators", "weaknesses_gaps", "benchmark_vs_peers"]],
  ["Market Opportunity", Target, [["tam", "auto", "TAM"], ["sam", "auto", "SAM"], ["som", "auto", "SOM"], "future_projections", "strategic_priorities", "go_to_market_strategy"]],
  ["Core Value Proposition & ESG", Leaf, ["core_value_proposition", ["esg_ratings", "auto", "ESG Ratings"], "sustainability_csr", "carbon_footprint", "ethical_sourcing"]],
  ["Culture & Work Life", Users, ["work_culture_summary", "manager_quality", "psychological_safety", "feedback_culture", "diversity_metrics", "diversity_inclusion_score", "ethical_standards", "burnout_risk", "mission_clarity", "crisis_behavior", "employee_turnover", "avg_retention_tenure", "layoff_history", "hiring_velocity"]],
  ["Recent News & Milestones", Newspaper, ["recent_news"]],
  ["Sales & Customer Metrics", PieChart, ["sales_motion", "customer_acquisition_cost", "customer_lifetime_value", ["cac_ltv_ratio", "auto", "CAC:LTV Ratio"], "churn_rate", "net_promoter_score", "customer_concentration_risk", "customer_testimonials"]],
  ["Risk & Compliance", Shield, ["regulatory_status", "legal_issues", "supply_chain_dependencies", "geopolitical_risks", "macro_risks", "key_challenges_needs", "exit_strategy_history"]],
  ["Work Location & Commute", Car, ["remote_policy_details", "typical_hours", "overtime_expectations", "weekend_work", "flexibility_level", "location_centrality", "public_transport_access", "cab_policy", "airport_commute_time", "office_zone_type"]],
  ["Safety & Wellbeing", ShieldCheck, ["area_safety", "safety_policies", "infrastructure_safety", "emergency_preparedness", "health_support"]],
  ["Career Growth & Learning", GraduationCap, ["training_spend", "onboarding_quality", "learning_culture", "exposure_quality", "mentorship_availability", "internal_mobility", "promotion_clarity", "tools_access", "role_clarity", "early_ownership", "work_impact", "execution_thinking_balance", "automation_level", "cross_functional_exposure", "company_maturity", "exit_opportunities", "skill_relevance", "global_exposure", "network_strength"]],
  ["Brand & Reputation", Award, ["brand_value", "brand_sentiment_score", "awards_recognitions", "external_recognition", "client_quality", ["marketing_video_url", "video", "Marketing Video"]]],
  ["Compensation & Benefits", Gift, ["fixed_vs_variable_pay", "bonus_predictability", ["esops_incentives", "auto", "ESOPs & Incentives"], "family_health_insurance", "relocation_support", "lifestyle_benefits", "leave_policy"]],
  ["Digital Presence & Ratings", Star, [["website_url", U, "Website"], "website_quality", ["website_rating", R], "website_traffic_rank", "social_media_followers", ["glassdoor_rating", R], ["indeed_rating", R], ["google_rating", R], ["linkedin_url", U, "LinkedIn"], "twitter_handle", ["facebook_url", U, "Facebook"], ["instagram_url", U, "Instagram"]]],
  ["Contact Information", Phone, ["primary_contact_email", "primary_phone_number", "contact_person_name", "contact_person_title", "contact_person_email", "contact_person_phone"]],
];

export function buildIntelligenceSections(profile?: CompanyProfile): IntelSection[] {
  return SCHEMA.map(([title, icon, fields]) => ({
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title,
    icon,
    fields: fields.map((f) => {
      const [key, type, label] = typeof f === "string" ? [f, "auto" as FieldType, undefined] : f;
      return { key, type, label: label ?? titleCaseFromCode(key), value: profile ? (profile[key] ?? "") : undefined };
    }),
  }));
}

export { Megaphone };
