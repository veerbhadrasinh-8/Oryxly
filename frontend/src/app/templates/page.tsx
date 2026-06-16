"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/features/auth/AuthGuard";
import { listTemplates } from "@/features/templates/api";

function TemplatesInner() {
  const { data, isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: listTemplates,
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 font-sans space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Templates</h1>
          <p className="text-sm text-neutral-500">
            Reusable email content. Personalize with{" "}
            <code>{"{{name}}"}</code> <code>{"{{company}}"}</code> <code>{"{{email}}"}</code>.
          </p>
        </div>
        <Link
          href="/templates/new"
          className="rounded-md bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 px-3 py-1.5 text-sm font-medium"
        >
          New template
        </Link>
      </header>

      {isLoading && <p className="text-sm">Loading…</p>}
      {data && data.length === 0 && (
        <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 px-6 py-12 text-center">
          <p className="text-sm text-neutral-500">
            No templates yet.{" "}
            <Link href="/templates/new" className="underline">
              Create your first one
            </Link>
            .
          </p>
        </div>
      )}

      {data && data.length > 0 && (
        <ul className="space-y-3">
          {data.map((t) => (
            <li key={t.id}>
              <Link
                href={`/templates/${t.id}`}
                className="block rounded-xl border border-neutral-200 dark:border-neutral-800 px-5 py-4 hover:border-neutral-400 dark:hover:border-neutral-600"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-neutral-500 font-mono mt-0.5">{t.subject}</p>
                  </div>
                  <div className="text-xs text-neutral-500 shrink-0">
                    {new Date(t.updated_at).toLocaleDateString()}
                  </div>
                </div>
                {t.variables.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {t.variables.map((v) => (
                      <span
                        key={v}
                        className="rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-1.5 py-0.5 text-xs font-mono"
                      >
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default function TemplatesPage() {
  return (
    <AuthGuard>
      <TemplatesInner />
    </AuthGuard>
  );
}
