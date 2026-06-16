"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteContactList, listContactLists } from "./api";

export function ContactListsTable() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["contact-lists"],
    queryFn: listContactLists,
  });

  const del = useMutation({
    mutationFn: deleteContactList,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contact-lists"] }),
  });

  if (isLoading) return <p className="text-sm">Loading…</p>;
  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        No contact lists yet. Upload one above.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 dark:bg-neutral-900/50 text-left text-xs uppercase text-neutral-500">
          <tr>
            <th className="px-4 py-2.5">Name</th>
            <th className="px-4 py-2.5 text-right">Total</th>
            <th className="px-4 py-2.5 text-right">Valid</th>
            <th className="px-4 py-2.5 text-right">Invalid</th>
            <th className="px-4 py-2.5">Created</th>
            <th className="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {data.map((cl) => (
            <tr key={cl.id}>
              <td className="px-4 py-3">
                <Link href={`/contacts/${cl.id}`} className="font-medium hover:underline">
                  {cl.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-right font-mono">{cl.total_contacts}</td>
              <td className="px-4 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                {cl.valid_contacts}
              </td>
              <td className="px-4 py-3 text-right font-mono text-red-600 dark:text-red-400">
                {cl.invalid_contacts}
              </td>
              <td className="px-4 py-3 text-xs text-neutral-500">
                {new Date(cl.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => {
                    if (confirm(`Delete list "${cl.name}"?`)) del.mutate(cl.id);
                  }}
                  disabled={del.isPending}
                  className="text-xs text-red-600 hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
