"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { createInvitation, deleteInvitation, type Invitation } from "./api";

export function InvitationsPanel({ invitations }: { invitations: Invitation[] }) {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const inviteMutation = useMutation({
    mutationFn: () => createInvitation(email.trim()),
    onSuccess: () => {
      setEmail("");
      setError(null);
      qc.invalidateQueries({ queryKey: ["admin-invitations"] });
    },
    onError: (err) => {
      const detail = isAxiosError(err) ? err.response?.data?.detail : null;
      setError(typeof detail === "string" ? detail : "Failed to invite");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (invId: string) => deleteInvitation(invId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-invitations"] }),
  });

  return (
    <div className="space-y-6">
      {/* Invite form */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Invite new user</h3>
        <form
          onSubmit={(e) => { e.preventDefault(); if (email.trim()) inviteMutation.mutate(); }}
          className="flex gap-2"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
            required
          />
          <button
            type="submit"
            disabled={inviteMutation.isPending}
            className="rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {inviteMutation.isPending ? "Inviting…" : "Invite"}
          </button>
        </form>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {/* Invitation list */}
      {invitations.length === 0 ? (
        <p className="text-sm text-neutral-500">No invitations sent yet.</p>
      ) : (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Sent</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {invitations.map((inv) => (
                <tr key={inv.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                  <td className="px-4 py-3">{inv.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        inv.is_used
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                      }`}
                    >
                      {inv.is_used ? "Registered" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {new Date(inv.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {!inv.is_used && (
                      <button
                        onClick={() => deleteMutation.mutate(inv.id)}
                        disabled={deleteMutation.isPending}
                        className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
