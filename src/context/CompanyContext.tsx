import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { getCompanySummaries } from "@/lib/companies";

export interface SelectedCompany { companyId: number; companyName: string; logoUrl: string }
const KEY = "selected-company";

interface Ctx {
  selected: SelectedCompany | null;
  ready: boolean;
  selectCompany: (c: SelectedCompany) => void;
}
const CompanyContext = createContext<Ctx | null>(null);

export function persistSelectedCompany(c: SelectedCompany) {
  try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* ignore */ }
}

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<SelectedCompany | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SelectedCompany;
        const match = getCompanySummaries().find((c) => c.companyId === parsed.companyId);
        if (match) setSelected({ companyId: match.companyId, companyName: match.name, logoUrl: match.logoUrl });
      }
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  const selectCompany = useCallback((c: SelectedCompany) => {
    persistSelectedCompany(c);
    setSelected(c);
  }, []);

  return <CompanyContext.Provider value={{ selected, ready, selectCompany }}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used inside CompanyProvider");
  return ctx;
}
