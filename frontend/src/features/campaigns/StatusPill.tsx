import type { CampaignStatus } from "@/types/campaigns";

const styles: Record<CampaignStatus, string> = {
  draft: "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  queued: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  running: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  cancelled: "bg-neutral-300 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200",
};

export function StatusPill({ status }: { status: CampaignStatus }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}
