import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

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
        if (parsed && typeof parsed.companyId === "number") {
          setSelected(parsed);
        }
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
