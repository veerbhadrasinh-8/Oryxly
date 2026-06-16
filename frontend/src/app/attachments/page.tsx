"use client";

import { useRef, useState, type DragEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { AuthGuard } from "@/features/auth/AuthGuard";
import {
  deleteAttachment,
  humanSize,
  listAttachments,
  uploadAttachment,
} from "@/features/attachments/api";

const ALLOWED = [".pdf", ".docx", ".png", ".jpg", ".jpeg"];
const MAX_BYTES = 10 * 1024 * 1024;

function AttachmentsInner() {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listQ = useQuery({ queryKey: ["attachments"], queryFn: listAttachments });

  const uploadM = useMutation({
    mutationFn: uploadAttachment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attachments"] });
      if (inputRef.current) inputRef.current.value = "";
      setError(null);
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

  const delM = useMutation({
    mutationFn: deleteAttachment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attachments"] }),
    onError: (err) => {
      if (isAxiosError(err)) {
        const d = err.response?.data?.detail;
        alert(typeof d === "string" ? d : "Delete failed");
      }
    },
  });

  function pick(f: File | null) {
    setError(null);
    if (!f) return;
    const ext = "." + (f.name.split(".").pop() ?? "").toLowerCase();
    if (!ALLOWED.includes(ext)) {
      return setError(`Unsupported type. Allowed: ${ALLOWED.join(", ")}`);
    }
    if (f.size > MAX_BYTES) {
      return setError("File exceeds 10 MB cap");
    }
    uploadM.mutate(f);
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    pick(e.dataTransfer.files[0] ?? null);
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 font-sans space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Attachments</h1>
        <p className="text-sm text-neutral-500">
          PDF · DOCX · PNG · JPG up to 10 MB. Attach to campaigns from the wizard or detail page.
        </p>
      </header>

      <section className="space-y-3 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
        <label
          htmlFor="att-file"
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-10 text-center transition ${
            dragging
              ? "border-neutral-900 dark:border-neutral-100 bg-neutral-100/50 dark:bg-neutral-900/40"
              : "border-neutral-300 dark:border-neutral-700"
          }`}
        >
          <p className="text-sm">
            {uploadM.isPending ? (
              "Uploading…"
            ) : (
              <>
                <span className="font-medium">Click to upload</span> or drag a file here
              </>
            )}
          </p>
          <p className="text-xs text-neutral-500">{ALLOWED.join(" · ")} · max 10 MB</p>
          <input
            ref={inputRef}
            id="att-file"
            type="file"
            accept={ALLOWED.join(",")}
            onChange={(e) => pick(e.target.files?.[0] ?? null)}
            className="hidden"
          />
        </label>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </section>

      <section>
        <h2 className="text-sm font-medium uppercase text-neutral-500 mb-3">
          Your files
        </h2>
        {listQ.isLoading && <p className="text-sm">Loading…</p>}
        {listQ.data && listQ.data.length === 0 && (
          <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 px-6 py-10 text-center text-sm text-neutral-500">
            No attachments yet.
          </div>
        )}
        {listQ.data && listQ.data.length > 0 && (
          <ul className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-800">
            {listQ.data.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{a.original_name}</p>
                  <p className="text-xs text-neutral-500 mt-0.5 font-mono">
                    {a.mime_type} · {humanSize(a.file_size)} ·{" "}
                    {new Date(a.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${a.original_name}"?`)) delM.mutate(a.id);
                  }}
                  disabled={delM.isPending}
                  className="text-xs text-red-600 hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default function AttachmentsPage() {
  return (
    <AuthGuard>
      <AttachmentsInner />
    </AuthGuard>
  );
}
