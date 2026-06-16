import type { RecipientStatus } from "@/types/logs";

const styles: Record<RecipientStatus, string> = {
  pending: "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  sent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  bounced: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

export function LogStatusPill({ status }: { status: RecipientStatus }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}
