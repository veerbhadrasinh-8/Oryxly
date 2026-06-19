"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { createTemplate, updateTemplate } from "./api";
import type { Template } from "@/types/templates";

const BUILTIN_VARS = ["name", "company", "email"] as const;
const VAR_PATTERN = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_ ]*)\s*\}\}/g;

const STARTER_HTML =
  "<p>Hi {{name}},</p>\n<p>I came across {{company}} and thought ORYXLY could help your outreach.</p>\n<p>Best,<br>Your name</p>";

type Mode =
  | { kind: "create" }
  | { kind: "edit"; template: Template };

function extractVars(...texts: string[]): string[] {
  const seen = new Set<string>();
  for (const t of texts) {
    for (const m of (t ?? "").matchAll(VAR_PATTERN)) seen.add(m[1].trim());
  }
  return [...seen];
}

const DEFAULT_SAMPLE: Record<string, string> = {
  name: "Alice Sharma",
  company: "Acme Exports",
  email: "alice@acme.com",
};

export function TemplateEditor({ mode }: { mode: Mode }) {
  const router = useRouter();
  const initial = mode.kind === "edit" ? mode.template : null;

  const [name, setName] = useState(initial?.name ?? "");
  const [subject, setSubject] = useState(initial?.subject ?? "");
  const [body, setBody] = useState(initial?.html_body ?? STARTER_HTML);
  const [error, setError] = useState<string | null>(null);

  // Sample data: starts with defaults, grows as user adds {{custom_vars}}
  const [sampleData, setSampleData] = useState<Record<string, string>>(DEFAULT_SAMPLE);

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setSubject(initial.subject);
      setBody(initial.html_body);
    }
  }, [initial]);

  const detected = useMemo(() => extractVars(subject, body), [subject, body]);

  // Auto-add sample data fields for any newly detected variable
  useEffect(() => {
    setSampleData((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const v of detected) {
        if (!(v in next)) {
          next[v] = "";
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [detected]);

  const previewSubject = useMemo(() => renderLocal(subject, sampleData), [subject, sampleData]);
  const previewBody = useMemo(() => renderLocal(body, sampleData), [body, sampleData]);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const autoResizeIframe = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        iframe.style.height = `${doc.documentElement.scrollHeight}px`;
      }
    } catch {
      // cross-origin guard — no-op
    }
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.style.height = "200px";
    const onLoad = () => autoResizeIframe();
    iframe.addEventListener("load", onLoad);
    return () => iframe.removeEventListener("load", onLoad);
  }, [previewBody, autoResizeIframe]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (mode.kind === "create") {
        const res = await createTemplate({ name, subject, html_body: body });
        return res.template_id;
      }
      await updateTemplate(mode.template.id, { name, subject, html_body: body });
      return mode.template.id;
    },
    onSuccess: (id) => {
      router.push(`/templates/${id}`);
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        if (typeof detail === "string") return setError(detail);
        if (!err.response) return setError(`Network error: ${err.message}`);
        return setError(`Save failed (${err.response.status})`);
      }
      setError("Save failed");
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !subject.trim() || !body.trim()) {
      return setError("Name, subject, and body are required");
    }
    saveMutation.mutate();
  }

  function insertVariable(varName: string) {
    setBody((b) => `${b}{{${varName}}}`);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <section className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="tpl-name">
            Template name
          </label>
          <input
            id="tpl-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Exporter outreach v1"
            className={inputCls}
          />
        </section>

        <section className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="tpl-subject">
            Subject
          </label>
          <input
            id="tpl-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Quick question for {{company}}"
            className={`${inputCls} font-mono`}
          />
        </section>

        <section className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium" htmlFor="tpl-body">
              HTML body
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {BUILTIN_VARS.map((v) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => insertVariable(v)}
                  className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-0.5 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-900"
                >
                  {`{{${v}}}`}
                </button>
              ))}
            </div>
          </div>
          <textarea
            id="tpl-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={14}
            className={`${inputCls} font-mono text-xs`}
          />
        </section>

        <section className="space-y-2">
          <div className="text-xs uppercase text-neutral-500">Detected variables</div>
          {detected.length === 0 ? (
            <p className="text-xs text-neutral-500">None yet — wrap text in {`{{ }}`}.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {detected.map((v) => (
                <span
                  key={v}
                  className="rounded px-2 py-0.5 text-xs font-mono bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                  title="Will be filled from contact data at send time"
                >
                  {`{{${v}}}`}
                </span>
              ))}
            </div>
          )}
          {detected.length > 0 && (
            <p className="text-xs text-neutral-500">
              Variables are filled from contact data at send time. Any column from your uploaded CSV/XLS file works — use the exact column name.
            </p>
          )}
        </section>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="rounded-md bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {saveMutation.isPending
              ? "Saving…"
              : mode.kind === "create"
                ? "Create template"
                : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/templates")}
            className="rounded-md border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>

      <aside className="space-y-4">
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-3">
          <div>
            <h2 className="text-sm font-medium uppercase text-neutral-500">Sample data</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Fields auto-expand as you add variables. Edit values to preview.
            </p>
          </div>
          <div className="grid gap-2 grid-cols-2 text-xs">
            {Object.keys(sampleData).map((key) => (
              <SampleField
                key={key}
                label={key}
                value={sampleData[key]}
                onChange={(v) => setSampleData((prev) => ({ ...prev, [key]: v }))}
              />
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <header className="bg-neutral-50 dark:bg-neutral-900/50 px-4 py-2 text-xs uppercase text-neutral-500">
            Preview
          </header>
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
            <div className="text-xs text-neutral-500">Subject</div>
            <div className="font-medium">{previewSubject || <em className="text-neutral-400">empty</em>}</div>
          </div>
          <iframe
            ref={iframeRef}
            srcDoc={previewBody}
            title="Email preview"
            sandbox="allow-same-origin"
            onLoad={autoResizeIframe}
            className="w-full min-h-[200px] border-0 block"
            style={{ height: 200 }}
          />
        </section>
      </aside>
    </form>
  );
}

function SampleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-neutral-500 font-mono truncate block" title={label}>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 outline-none focus:border-neutral-900 dark:focus:border-neutral-200 text-xs"
        placeholder={`sample ${label}`}
      />
    </label>
  );
}

const inputCls =
  "w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:focus:border-neutral-200";

function renderLocal(text: string, data: Record<string, string>): string {
  return (text ?? "").replace(VAR_PATTERN, (_, key) => data[key.trim()] ?? "");
}
