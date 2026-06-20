"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { addSmtp } from "./api";

const PRESETS = [
  { label: "Gmail", host: "smtp.gmail.com", port: 587 },
  { label: "Outlook", host: "smtp.office365.com", port: 587 },
  { label: "Zoho", host: "smtp.zoho.in", port: 587 },
  { label: "SendGrid", host: "smtp.sendgrid.net", port: 587 },
];

export function SmtpForm({ onCreated }: { onCreated?: () => void }) {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [host, setHost] = useState("smtp.gmail.com");
  const [port, setPort] = useState(587);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const mutation = useMutation({
    mutationFn: addSmtp,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["smtp"] });
      setEmail("");
      setUsername("");
      setPassword("");
      setError(null);
      onCreated?.();
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        if (typeof detail === "string") return setError(detail);
        if (err.response?.status === 500) return setError("Server error - check backend logs");
        if (!err.response) return setError(`Network error: ${err.message}`);
        return setError(`Request failed (${err.response.status})`);
      }
      setError("Failed to add SMTP");
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!confirmed) return;
    setError(null);
    mutation.mutate({
      email,
      smtp_host: host,
      smtp_port: port,
      smtp_username: username || email,
      smtp_password: password,
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
      <header>
        <h2 className="text-lg font-semibold">Add SMTP account</h2>
        <p className="text-sm text-neutral-500">We verify credentials before saving.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              setHost(p.host);
              setPort(p.port);
            }}
            className={`rounded-md border px-3 py-1 text-xs ${
              host === p.host
                ? "border-neutral-900 dark:border-neutral-100"
                : "border-neutral-300 dark:border-neutral-700"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="From email" required>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="hello@company.com"
          />
        </Field>
        <Field label="SMTP username">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputCls}
            placeholder="defaults to From email"
          />
        </Field>
        <Field label="Host" required>
          <input
            type="text"
            required
            value={host}
            onChange={(e) => setHost(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Port" required>
          <input
            type="number"
            required
            min={1}
            max={65535}
            value={port}
            onChange={(e) => setPort(Number(e.target.value))}
            className={inputCls}
          />
        </Field>
        <Field label="Password / App password" required className="sm:col-span-2">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
            placeholder="Stored encrypted with Fernet"
          />
        </Field>
      </div>

      <div className="rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20 p-4 space-y-2">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
          ⚠️ SMTP accounts cannot be deleted
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Once saved, this account is permanently locked to your profile. You will not be able to
          remove it under any circumstances.
        </p>
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-amber-400 accent-amber-600"
          />
          <span className="text-xs text-amber-800 dark:text-amber-300">
            I understand this SMTP account cannot be deleted once added
          </span>
        </label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={mutation.isPending || !confirmed}
        className="rounded-md bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {mutation.isPending ? "Verifying…" : "Verify & save"}
      </button>
    </form>
  );
}

const inputCls =
  "w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:focus:border-neutral-200";

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`space-y-1.5 block ${className ?? ""}`}>
      <span className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
