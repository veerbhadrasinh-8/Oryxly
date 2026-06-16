"use client";

import Link from "next/link";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/features/auth/AuthGuard";
import { getContactList } from "@/features/contacts/api";

function Detail({ id }: { id: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["contact-lists", id],
    queryFn: () => getContactList(id),
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 font-sans space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/contacts" className="text-sm text-neutral-500 hover:underline">
            ← Contacts
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight mt-2">
            {data?.name ?? "List"}
          </h1>
          {data && (
            <p className="text-sm text-neutral-500">
              {data.valid_contacts} valid · {data.invalid_contacts} invalid · {data.total_contacts} total
            </p>
          )}
        </div>
      </header>

      {isLoading && <p className="text-sm">Loading…</p>}
      {error && <p className="text-sm text-red-500">Failed to load list</p>}

      {data && (
        <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-900/50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-2.5">Email</th>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Company</th>
                <th className="px-4 py-2.5">Phone</th>
                <th className="px-4 py-2.5">Custom</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {data.contacts.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-mono">{c.email}</td>
                  <td className="px-4 py-3">{c.name ?? "—"}</td>
                  <td className="px-4 py-3">{c.company ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500 font-mono">
                    {c.custom_data ? JSON.stringify(c.custom_data) : "—"}
                  </td>
                </tr>
              ))}
              {data.contacts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-neutral-500">
                    No valid contacts in this list.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default function ContactListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AuthGuard>
      <Detail id={id} />
    </AuthGuard>
  );
}
