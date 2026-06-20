"use client";

import { useRef, useState, type DragEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { uploadContacts } from "./api";
import type { UploadResponse } from "@/types/contacts";

const ALLOWED = [".csv", ".xlsx", ".xls"];
const MAX_BYTES = 10 * 1024 * 1024;

type Stats = UploadResponse["data"];

export function UploadCard() {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Stats | null>(null);

  const mutation = useMutation({
    mutationFn: () => uploadContacts(file!, name.trim() || undefined),
    onSuccess: (data) => {
      setResult(data);
      setFile(null);
      setName("");
      if (inputRef.current) inputRef.current.value = "";
      qc.invalidateQueries({ queryKey: ["contact-lists"] });
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        if (typeof detail === "string") return setError(detail);
        if (!err.response) return setError(`Network error: ${err.message}`);
        return setError(`Upload failed (${err.response.status})`);
      }
      setError("Upload failed");
    },
  });

  function chooseFile(f: File | null) {
    setError(null);
    setResult(null);
    if (!f) return setFile(null);
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED.includes(ext)) {
      return setError(`Unsupported file type. Allowed: ${ALLOWED.join(", ")}`);
    }
    if (f.size > MAX_BYTES) {
      return setError("File exceeds 10 MB cap");
    }
    setFile(f);
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    chooseFile(e.dataTransfer.files[0] ?? null);
  }

  return (
    <section className="space-y-4 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
      <header>
        <h2 className="text-lg font-semibold">Upload contacts</h2>
        <p className="text-sm text-neutral-500">CSV, XLSX or XLS · max 10 MB</p>
      </header>

      <label
        htmlFor="contacts-file"
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-10 text-center transition ${
          dragging
            ? "border-neutral-900 dark:border-neutral-100 bg-neutral-100/50 dark:bg-neutral-900/40"
            : "border-neutral-300 dark:border-neutral-700"
        }`}
      >
        <p className="text-sm">
          {file ? (
            <span className="font-mono">{file.name}</span>
          ) : (
            <>
              <span className="font-medium">Click to choose</span> or drag a file here
            </>
          )}
        </p>
        <p className="text-xs text-neutral-500">
          Required column: <code>email</code>. Optional: <code>name</code>, <code>company</code>, <code>phone</code>. Extra columns are kept as custom data.
        </p>
        <input
          ref={inputRef}
          id="contacts-file"
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => chooseFile(e.target.files?.[0] ?? null)}
          className="hidden"
        />
      </label>

      <input
        type="text"
        placeholder="List name (defaults to filename)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:focus:border-neutral-200"
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="button"
        disabled={!file || mutation.isPending}
        onClick={() => mutation.mutate()}
        className="rounded-md bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {mutation.isPending ? "Uploading…" : "Upload & process"}
      </button>

      {result && (
        <div className="space-y-3 rounded-md border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Imported as <span className="font-mono">{result.name}</span>
          </p>
          <ul className="grid grid-cols-4 gap-3 text-sm">
            <Stat label="Total" value={result.stats.total} />
            <Stat label="Valid" value={result.stats.valid} accent="emerald" />
            <Stat label="Invalid" value={result.stats.invalid} accent="red" />
            <Stat label="Duplicates" value={result.stats.duplicates} accent="amber" />
          </ul>
          {result.invalid_preview.length > 0 && (
            <details className="text-xs">
              <summary className="cursor-pointer text-neutral-600 dark:text-neutral-400">
                Show first {result.invalid_preview.length} invalid rows
              </summary>
              <ul className="mt-2 space-y-1 font-mono">
                {result.invalid_preview.map((r) => (
                  <li key={r.row_number}>
                    row {r.row_number}: <span className="text-red-500">{r.reason}</span>{" "}
                    - {JSON.stringify(r.raw)}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </section>
  );
}

const accentMap = {
  emerald: "text-emerald-600 dark:text-emerald-400",
  red: "text-red-600 dark:text-red-400",
  amber: "text-amber-600 dark:text-amber-400",
} as const;

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: keyof typeof accentMap;
}) {
  return (
    <li className="rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-2">
      <div className="text-xs uppercase text-neutral-500">{label}</div>
      <div className={`text-lg font-semibold ${accent ? accentMap[accent] : ""}`}>{value}</div>
    </li>
  );
}
