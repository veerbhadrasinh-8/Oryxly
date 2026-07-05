"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { updateUser, type AdminUser, type UserUpdatePayload } from "./api";

const PLANS = ["lite", "starter", "growth", "agency"];

function LimitEditor({
  user,
  onSave,
  pending,
}: {
  user: AdminUser;
  onSave: (payload: UserUpdatePayload) => void;
  pending: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(user.effective_monthly_limit));

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm">{user.effective_monthly_limit.toLocaleString()}</span>
        {user.monthly_email_limit !== null ? (
          <span className="text-xs text-violet-600 dark:text-violet-400">custom</span>
        ) : (
          <span className="text-xs text-neutral-400">plan default</span>
        )}
        <button
          onClick={() => { setValue(String(user.effective_monthly_limit)); setEditing(true); }}
          className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 underline"
        >
          edit
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-24 rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-sm"
      />
      <button
        onClick={() => { onSave({ monthly_email_limit: Math.max(0, parseInt(value, 10) || 0) }); setEditing(false); }}
        disabled={pending}
        className="rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-2 py-1 text-xs disabled:opacity-50"
      >
        Save
      </button>
      {user.monthly_email_limit !== null && (
        <button
          onClick={() => { onSave({ clear_monthly_email_limit: true }); setEditing(false); }}
          disabled={pending}
          className="rounded-md border border-neutral-300 dark:border-neutral-700 px-2 py-1 text-xs disabled:opacity-50"
          title="Revert to plan default"
        >
          Reset
        </button>
      )}
      <button
        onClick={() => setEditing(false)}
        className="rounded-md border border-neutral-300 dark:border-neutral-700 px-2 py-1 text-xs"
      >
        ✕
      </button>
    </div>
  );
}

function InlineNumberEditor({
  label,
  currentValue,
  isCustom,
  onSave,
  onClear,
  pending,
  min,
}: {
  label: string;
  currentValue: number;
  isCustom: boolean;
  onSave: (v: number) => void;
  onClear: () => void;
  pending: boolean;
  min?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(currentValue));

  return (
    <div className="py-2 border-b border-neutral-200 dark:border-neutral-800 last:border-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-neutral-500">{label}</span>
        {isCustom && (
          <span className="text-[10px] text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-1.5 py-0.5 rounded">custom</span>
        )}
      </div>
      {!editing ? (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">{currentValue.toLocaleString()}</span>
          <button
            onClick={() => { setValue(String(currentValue)); setEditing(true); }}
            className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 underline"
          >
            edit
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 flex-wrap">
          <input
            type="number"
            min={min ?? 0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-20 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-0.5 text-sm"
          />
          <button
            onClick={() => { onSave(Math.max(min ?? 0, parseInt(value, 10) || 0)); setEditing(false); }}
            disabled={pending}
            className="rounded bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-2 py-0.5 text-xs disabled:opacity-50"
          >
            Save
          </button>
          {isCustom && (
            <button
              onClick={() => { onClear(); setEditing(false); }}
              disabled={pending}
              className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-0.5 text-xs disabled:opacity-50"
            >
              Reset
            </button>
          )}
          <button onClick={() => setEditing(false)} className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-0.5 text-xs">✕</button>
        </div>
      )}
    </div>
  );
}

function CustomLimitsDropdown({
  user,
  onSave,
  pending,
}: {
  user: AdminUser;
  onSave: (payload: UserUpdatePayload) => void;
  pending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-md border border-neutral-300 dark:border-neutral-700 px-2.5 py-1 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
      >
        Custom limits
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-64 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg p-3">
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Override plan limits</p>

          <InlineNumberEditor
            label="Monthly emails"
            currentValue={user.effective_monthly_limit}
            isCustom={user.monthly_email_limit !== null}
            pending={pending}
            min={0}
            onSave={(v) => onSave({ monthly_email_limit: v })}
            onClear={() => onSave({ clear_monthly_email_limit: true })}
          />

          <InlineNumberEditor
            label="SMTP accounts"
            currentValue={user.effective_smtp_limit}
            isCustom={user.smtp_account_limit !== null}
            pending={pending}
            min={1}
            onSave={(v) => onSave({ smtp_account_limit: v })}
            onClear={() => onSave({ clear_smtp_account_limit: true })}
          />
        </div>
      )}
    </div>
  );
}

export function UsersTable({ users }: { users: AdminUser[] }) {
  const qc = useQueryClient();
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UserUpdatePayload }) =>
      updateUser(userId, payload),
    onSuccess: (_, { userId }) => {
      setFeedback((f) => ({ ...f, [userId]: "Saved" }));
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setTimeout(() => setFeedback((f) => { const n = { ...f }; delete n[userId]; return n; }), 2000);
    },
    onError: (err, { userId }) => {
      const detail = isAxiosError(err) ? err.response?.data?.detail : null;
      setFeedback((f) => ({ ...f, [userId]: typeof detail === "string" ? detail : "Error" }));
    },
  });

  if (users.length === 0) {
    return <p className="text-sm text-neutral-500">No users yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
          <tr>
            <th className="text-left px-4 py-3 font-medium">Name / Email</th>
            <th className="text-left px-4 py-3 font-medium">Plan</th>
            <th className="text-left px-4 py-3 font-medium">Monthly emails</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
            <th className="text-left px-4 py-3 font-medium">Custom limits</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
              <td className="px-4 py-3">
                <p className="font-medium">{u.full_name}</p>
                <p className="text-xs text-neutral-500">{u.email}</p>
                {u.is_admin && (
                  <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">Admin</span>
                )}
              </td>
              <td className="px-4 py-3">
                {u.is_admin ? (
                  <span className="capitalize text-neutral-400">{u.plan}</span>
                ) : (
                  <select
                    defaultValue={u.plan}
                    onChange={(e) => mutation.mutate({ userId: u.id, payload: { plan: e.target.value } })}
                    className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-sm capitalize"
                  >
                    {PLANS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                )}
              </td>
              <td className="px-4 py-3">
                {u.is_admin ? (
                  <span className="text-neutral-400">-</span>
                ) : (
                  <LimitEditor
                    user={u}
                    pending={mutation.isPending}
                    onSave={(payload) => mutation.mutate({ userId: u.id, payload })}
                  />
                )}
              </td>
              <td className="px-4 py-3">
                {u.is_admin ? (
                  <span className="text-neutral-400">-</span>
                ) : (
                  <button
                    onClick={() => mutation.mutate({ userId: u.id, payload: { is_active: !u.is_active } })}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      u.is_active
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                    }`}
                  >
                    {u.is_active ? "Active" : "Disabled"}
                  </button>
                )}
              </td>
              <td className="px-4 py-3">
                {u.is_admin ? (
                  <span className="text-neutral-400">-</span>
                ) : (
                  <CustomLimitsDropdown
                    user={u}
                    pending={mutation.isPending}
                    onSave={(payload) => mutation.mutate({ userId: u.id, payload })}
                  />
                )}
              </td>
              <td className="px-4 py-3 text-xs">
                {feedback[u.id] && (
                  <span className={feedback[u.id] === "Saved" ? "text-emerald-600" : "text-red-500"}>
                    {feedback[u.id]}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
