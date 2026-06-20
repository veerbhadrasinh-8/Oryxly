import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

/** Wraps a public marketing page with the shared header and footer. */
export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-sans">
      <MarketingHeader />
      <main className="mx-auto max-w-6xl px-6 py-16">{children}</main>
      <MarketingFooter />
    </div>
  );
}
