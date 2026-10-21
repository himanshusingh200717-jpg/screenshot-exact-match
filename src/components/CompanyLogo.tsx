import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { domainFromUrl } from "@/lib/companyData";

export function CompanyLogo({ name, logoUrl, websiteUrl, className }: { name: string; logoUrl?: string; websiteUrl?: string; className?: string }) {
  const sources = useMemo(() => {
    const key = import.meta.env["VITE_LOGO_DEV_PUBLISHABLE_KEY"] as string | undefined;
    const domain = websiteUrl ? domainFromUrl(websiteUrl) : "";
    const list: string[] = [];
    if (key && domain) list.push(`https://img.logo.dev/${domain}?token=${key}&size=128`);
    if (logoUrl) list.push(logoUrl);
    return list;
  }, [logoUrl, websiteUrl]);
  const [idx, setIdx] = useState(0);
  const base = cn("flex shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-card", className ?? "h-12 w-12");

  if (idx >= sources.length) {
    return <div className={cn(base, "font-heading text-lg font-semibold text-link bg-link-soft")}>{name.charAt(0).toUpperCase()}</div>;
  }
  return (
    <div className={cn(base, "p-1.5")}>
      <img src={sources[idx]} alt={`${name} logo`} className="h-full w-full object-contain" onError={() => setIdx((i) => i + 1)} />
    </div>
  );
}
