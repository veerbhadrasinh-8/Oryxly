"use client";

import Link from "next/link";
import { use, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/features/auth/AuthGuard";
import { getContactList } from "@/features/contacts/api";
import type { Contact } from "@/types/contacts";

const BUILTIN_COLS = ["email", "name", "company", "phone"] as const;

/** Collect every key that appears in any contact's custom_data, in insertion order. */
function collectCustomKeys(contacts: Contact[]): string[] {
  const seen = new Set<string>();
  for (const c of contacts) {
    if (c.custom_data) {
      for (const k of Object.keys(c.custom_data)) seen.add(k);
    }
  }
  return [...seen];
}

function Detail({ id }: { id: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["contact-lists", id],
    queryFn: () => getContactList(id),
  });

  const customKeys = useMemo(
    () => (data ? collectCustomKeys(data.contacts) : []),
    [data],
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 font-sans space-y-6">
      <header className="flex items-start justify-between">
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
        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-neutral-50 dark:bg-neutral-900/50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-2.5">Email</th>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Company</th>
                <th className="px-4 py-2.5">Phone</th>
                {customKeys.map((k) => (
                  <th key={k} className="px-4 py-2.5">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {data.contacts.length === 0 && (
                <tr>
                  <td
                    colSpan={BUILTIN_COLS.length + customKeys.length}
                    className="px-4 py-6 text-center text-sm text-neutral-500"
                  >
                    No valid contacts in this list.
                  </td>
                </tr>
              )}
              {data.contacts.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/30">
                  <td className="px-4 py-3 font-mono text-xs">{c.email}</td>
                  <td className="px-4 py-3">{c.name ?? <span className="text-neutral-400">-</span>}</td>
                  <td className="px-4 py-3">{c.company ?? <span className="text-neutral-400">-</span>}</td>
                  <td className="px-4 py-3 font-mono text-xs">{c.phone ?? <span className="text-neutral-400">-</span>}</td>
                  {customKeys.map((k) => {
                    const val = c.custom_data?.[k];
                    return (
                      <td key={k} className="px-4 py-3 text-xs max-w-xs">
                        {val ? (
                          <span className="block truncate" title={val}>{val}</span>
                        ) : (
                          <span className="text-neutral-400">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
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
