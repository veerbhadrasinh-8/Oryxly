"use client";

import Link from "next/link";
import { use } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthGuard } from "@/features/auth/AuthGuard";
import { deleteTemplate, getTemplate } from "@/features/templates/api";
import { TemplateEditor } from "@/features/templates/TemplateEditor";

function Detail({ id }: { id: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["templates", id],
    queryFn: () => getTemplate(id),
  });

  const del = useMutation({
    mutationFn: () => deleteTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["templates"] });
      router.replace("/templates");
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 font-sans space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/templates" className="text-sm text-neutral-500 hover:underline">
            ← Templates
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight mt-2">
            {data?.name ?? "Loading…"}
          </h1>
        </div>
        {data && (
          <button
            onClick={() => {
              if (confirm(`Delete template "${data.name}"?`)) del.mutate();
            }}
            disabled={del.isPending}
            className="rounded-md border border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 px-3 py-1.5 text-sm hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
          >
            {del.isPending ? "Deleting…" : "Delete"}
          </button>
        )}
      </header>

      {isLoading && <p className="text-sm">Loading…</p>}
      {error && <p className="text-sm text-red-500">Failed to load template</p>}
      {data && <TemplateEditor mode={{ kind: "edit", template: data }} />}
    </main>
  );
}

export default function TemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AuthGuard>
      <Detail id={id} />
    </AuthGuard>
  );
}
