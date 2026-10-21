import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCompany } from "@/context/CompanyContext";

/** Restores the selected company after refresh; sends visitors home if none is saved. */
export function useRequiredCompany() {
  const { selected, ready } = useCompany();
  const navigate = useNavigate();
  useEffect(() => {
    if (ready && !selected) navigate({ to: "/", replace: true });
  }, [ready, selected, navigate]);
  return ready ? selected : null;
}
