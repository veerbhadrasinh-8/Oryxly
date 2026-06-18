"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { deleteContactList, listContactLists } from "./api";

export function ContactListsTable() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["contact-lists"],
    queryFn: listContactLists,
  });

  // Track which list ID is being deleted + any per-row error
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<{ id: string; msg: string } | null>(null);

  const del = useMutation({
    mutationFn: (id: string) => {
      setDeletingId(id);
      setDeleteError(null);
      return deleteContactList(id);
    },
    onSuccess: () => {
      setDeletingId(null);
      qc.invalidateQueries({ queryKey: ["contact-lists"] });
    },
    onError: (err, id) => {
      setDeletingId(null);
      const detail = isAxiosError(err) ? err.response?.data?.detail : null;
      setDeleteError({
        id,
        msg: typeof detail === "string" ? detail : `Delete failed (${isAxiosError(err) ? err.response?.status ?? "network" : "unknown"})`,
      });
    },
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
    <div className="space-y-2">
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
            {data.map((cl) => {
              const isThisDeleting = deletingId === cl.id;
              const rowError = deleteError?.id === cl.id ? deleteError.msg : null;
              return (
                <React.Fragment key={cl.id}>
                  <tr>
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
                          if (confirm(`Delete list "${cl.name}"? This cannot be undone.`)) {
                            del.mutate(cl.id);
                          }
                        }}
                        disabled={isThisDeleting}
                        className="text-xs text-red-600 hover:underline disabled:opacity-50"
                      >
                        {isThisDeleting ? "Deleting…" : "Delete"}
                      </button>
                    </td>
                  </tr>
                  {rowError && (
                    <tr key={`${cl.id}-err`}>
                      <td colSpan={6} className="px-4 py-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/20">
                        {rowError}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
