"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { createCampaign, launchCampaign, previewCampaignContent } from "./api";
import { listSmtp } from "@/features/smtp/api";
import { getContactListColumns, listContactLists } from "@/features/contacts/api";

// ---- variable normalization (must match backend normalize_var exactly) ----

function normalizeVar(col: string): string {
  return col
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function isEmailLike(varName: string): boolean {
  return varName === "email" || varName.includes("email");
}

// ---- wizard steps ----

const STEPS = ["Name", "Sender", "Audience", "Variables", "Content", "Review"] as const;
type Step = (typeof STEPS)[number];

const VAR_RE = /\{\{\s*([a-z][a-z0-9_]*)\s*\}\}/g;

function extractVars(text: string): string[] {
  const found = new Set<string>();
  for (const m of text.matchAll(VAR_RE)) found.add(m[1]);
  return [...found];
}

function renderLocal(text: string, data: Record<string, string>): string {
  return text.replace(VAR_RE, (_, k) => data[k] ?? "");
}

// ---- component ----

export function CampaignWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("Name");
  const [error, setError] = useState<string | null>(null);

  // Step: Name
  const [name, setName] = useState("");

  // Step: Sender
  const [smtpId, setSmtpId] = useState<string | null>(null);

  // Step: Audience
  const [listId, setListId] = useState<string | null>(null);

  // Step: Variables
  // allColumns = [{original, normalized}] from the selected list
  const [allColumns, setAllColumns] = useState<{ original: string; normalized: string }[]>([]);
  const [selectedVars, setSelectedVars] = useState<Set<string>>(new Set());

  // Step: Content
  const [toVar, setToVar] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [focusedField, setFocusedField] = useState<"subject" | "body">("body");

  // Step: Review
  const [launchNow, setLaunchNow] = useState(true);

  const smtpQ = useQuery({ queryKey: ["smtp"], queryFn: listSmtp });
  const listQ = useQuery({ queryKey: ["contact-lists"], queryFn: listContactLists });

  const columnsQ = useQuery({
    queryKey: ["contact-list-columns", listId],
    queryFn: () => getContactListColumns(listId!),
    enabled: !!listId,
  });

  const activeSmtps = smtpQ.data?.filter((s) => s.status === "active") ?? [];
  const usableLists = listQ.data?.filter((l) => l.valid_contacts > 0) ?? [];

  // Auto-pick single options
  useEffect(() => {
    if (activeSmtps.length === 1 && !smtpId) setSmtpId(activeSmtps[0].id);
  }, [activeSmtps, smtpId]);
  useEffect(() => {
    if (usableLists.length === 1 && !listId) setListId(usableLists[0].id);
  }, [usableLists, listId]);

  // When columns load, build allColumns and auto-select all
  useEffect(() => {
    if (!columnsQ.data) return;
    const builtin = (columnsQ.data.builtin ?? []).map((b: string) => ({
      original: b,
      normalized: normalizeVar(b),
    }));
    const custom = (columnsQ.data.custom ?? []).map((c: string) => ({
      original: c,
      normalized: normalizeVar(c),
    }));
    const cols = [...builtin, ...custom];
    setAllColumns(cols);
    setSelectedVars(new Set(cols.map((c) => c.normalized)));
  }, [columnsQ.data]);

  // Auto-set toVar when selectedVars changes
  useEffect(() => {
    const vars = [...selectedVars];
    const emailVar = vars.find(isEmailLike) ?? vars[0] ?? "";
    setToVar(emailVar);
  }, [selectedVars]);

  const selectedVarList = useMemo(() => [...selectedVars], [selectedVars]);

  // Variable insertion into focused field
  function insertVar(varName: string) {
    const token = `{{${varName}}}`;
    if (focusedField === "subject") setSubject((s) => s + token);
    else setBody((b) => b + token);
  }

  // Validation: vars used in subject/body must all be in selectedVars
  const usedVars = useMemo(() => {
    const all = new Set([...extractVars(subject), ...extractVars(body)]);
    return all;
  }, [subject, body]);

  const unknownVars = useMemo(
    () => [...usedVars].filter((v) => !selectedVars.has(v)),
    [usedVars, selectedVars],
  );

  function canAdvance(): boolean {
    switch (step) {
      case "Name": return name.trim().length > 0;
      case "Sender": return !!smtpId;
      case "Audience": return !!listId;
      case "Variables": return selectedVars.size > 0;
      case "Content": return subject.trim().length > 0 && body.trim().length > 0 && !!toVar && unknownVars.length === 0;
      case "Review": return true;
    }
  }

  function next() {
    const i = STEPS.indexOf(step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1]);
  }
  function back() {
    const i = STEPS.indexOf(step);
    if (i > 0) setStep(STEPS[i - 1]);
  }

  const chosenSmtp = activeSmtps.find((s) => s.id === smtpId);
  const chosenList = usableLists.find((l) => l.id === listId);

  const createAndMaybeLaunch = useMutation({
    mutationFn: async () => {
      const { campaign_id } = await createCampaign({
        name: name.trim(),
        smtp_account_id: smtpId!,
        contact_list_id: listId!,
        subject,
        html_body: body,
        to_variable: toVar,
        selected_columns: selectedVarList,
      });
      if (launchNow) await launchCampaign(campaign_id);
      return campaign_id;
    },
    onSuccess: (id) => router.push(`/campaigns/${id}`),
    onError: (err) => {
      if (isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        if (typeof detail === "string") return setError(detail);
        if (!err.response) return setError(`Network error: ${err.message}`);
        return setError(`Request failed (${err.response.status})`);
      }
      setError("Failed to create campaign");
    },
  });

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <ol className="flex gap-3 text-xs flex-wrap">
        {STEPS.map((s, i) => {
          const isActive = s === step;
          const isDone = STEPS.indexOf(step) > i;
          return (
            <li
              key={s}
              className={`flex items-center gap-1.5 ${
                isActive
                  ? "text-neutral-900 dark:text-neutral-100 font-medium"
                  : isDone
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-neutral-400"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] shrink-0 ${
                  isActive
                    ? "bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900"
                    : isDone
                      ? "bg-emerald-500 text-white"
                      : "bg-neutral-200 dark:bg-neutral-800"
                }`}
              >
                {isDone ? "✓" : i + 1}
              </span>
              {s}
            </li>
          );
        })}
      </ol>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 min-h-72">
        {step === "Name" && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Name your campaign</h2>
            <p className="text-sm text-neutral-500">Internal only — recipients won&apos;t see this.</p>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dubai clinics — June outreach"
              className={inputCls}
            />
          </section>
        )}

        {step === "Sender" && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Choose sender</h2>
            <p className="text-sm text-neutral-500">Only verified SMTP accounts are eligible.</p>
            {smtpQ.isLoading && <p className="text-sm">Loading…</p>}
            {smtpQ.data && activeSmtps.length === 0 && (
              <NoneAvailable message="No verified SMTP accounts." cta="Add one" href="/smtp" />
            )}
            <div className="space-y-2">
              {activeSmtps.map((s) => (
                <PickRow
                  key={s.id}
                  selected={smtpId === s.id}
                  onClick={() => setSmtpId(s.id)}
                  title={s.email}
                  subtitle={`${s.smtp_host}:${s.smtp_port}`}
                />
              ))}
            </div>
          </section>
        )}

        {step === "Audience" && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Pick contact list</h2>
            {listQ.isLoading && <p className="text-sm">Loading…</p>}
            {listQ.data && usableLists.length === 0 && (
              <NoneAvailable message="No contact lists with valid recipients." cta="Upload contacts" href="/contacts" />
            )}
            <div className="space-y-2">
              {usableLists.map((l) => (
                <PickRow
                  key={l.id}
                  selected={listId === l.id}
                  onClick={() => setListId(l.id)}
                  title={l.name}
                  subtitle={`${l.valid_contacts} valid recipient${l.valid_contacts === 1 ? "" : "s"}`}
                />
              ))}
            </div>
          </section>
        )}

        {step === "Variables" && (
          <VariableStep
            allColumns={allColumns}
            selectedVars={selectedVars}
            setSelectedVars={setSelectedVars}
            isLoading={columnsQ.isLoading}
          />
        )}

        {step === "Content" && (
          <ContentStep
            selectedVarList={selectedVarList}
            toVar={toVar}
            setToVar={setToVar}
            subject={subject}
            setSubject={setSubject}
            body={body}
            setBody={setBody}
            focusedField={focusedField}
            setFocusedField={setFocusedField}
            insertVar={insertVar}
            unknownVars={unknownVars}
          />
        )}

        {step === "Review" && (
          <ReviewStep
            name={name}
            smtpEmail={chosenSmtp?.email}
            listName={chosenList?.name}
            listSize={chosenList?.valid_contacts}
            listId={listId!}
            subject={subject}
            body={body}
            toVar={toVar}
            launchNow={launchNow}
            setLaunchNow={setLaunchNow}
          />
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center justify-between">
        {step !== "Name" ? (
          <button type="button" onClick={back} className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm">
            ← Back
          </button>
        ) : (
          <Link href="/campaigns" className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm">
            Cancel
          </Link>
        )}

        {step !== "Review" ? (
          <button
            type="button"
            onClick={next}
            disabled={!canAdvance()}
            className="rounded-md bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 px-4 py-1.5 text-sm font-medium disabled:opacity-50"
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            onClick={() => createAndMaybeLaunch.mutate()}
            disabled={createAndMaybeLaunch.isPending}
            className="rounded-md bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 px-4 py-1.5 text-sm font-medium disabled:opacity-50"
          >
            {createAndMaybeLaunch.isPending ? "Creating…" : launchNow ? "Create & launch" : "Save draft"}
          </button>
        )}
      </div>
    </div>
  );
}

// ---- Variable step ----

function VariableStep({
  allColumns,
  selectedVars,
  setSelectedVars,
  isLoading,
}: {
  allColumns: { original: string; normalized: string }[];
  selectedVars: Set<string>;
  setSelectedVars: (s: Set<string>) => void;
  isLoading: boolean;
}) {
  function toggle(normalized: string) {
    const next = new Set(selectedVars);
    if (next.has(normalized)) next.delete(normalized);
    else next.add(normalized);
    setSelectedVars(next);
  }

  function toggleAll(on: boolean) {
    setSelectedVars(on ? new Set(allColumns.map((c) => c.normalized)) : new Set());
  }

  if (isLoading) return <p className="text-sm">Analysing contact list columns…</p>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Select template variables</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Choose which columns from your contact list to use as personalisation variables in the email. Each selected column becomes a <code className="font-mono text-xs">{"{{variable}}"}</code> you can use in your subject and body.
        </p>
      </div>

      {allColumns.length === 0 ? (
        <p className="text-sm text-neutral-500">No columns detected in this contact list.</p>
      ) : (
        <>
          <div className="flex items-center gap-3 text-xs">
            <button type="button" onClick={() => toggleAll(true)} className="underline text-neutral-500">Select all</button>
            <button type="button" onClick={() => toggleAll(false)} className="underline text-neutral-500">Deselect all</button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {allColumns.map(({ original, normalized }) => {
              const checked = selectedVars.has(normalized);
              return (
                <label
                  key={normalized}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition ${
                    checked
                      ? "border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-900/40"
                      : "border-neutral-300 dark:border-neutral-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(normalized)}
                    className="h-4 w-4 accent-neutral-900 dark:accent-neutral-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{original}</div>
                    <div className="text-xs font-mono text-neutral-500 mt-0.5">{`{{${normalized}}}`}</div>
                  </div>
                </label>
              );
            })}
          </div>

          {selectedVars.size > 0 && (
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 px-4 py-3">
              <div className="text-xs uppercase text-neutral-500 mb-2">Selected variables</div>
              <div className="flex flex-wrap gap-1.5">
                {[...selectedVars].map((v) => (
                  <span key={v} className="rounded px-2 py-0.5 text-xs font-mono bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ---- Content step ----

function ContentStep({
  selectedVarList,
  toVar,
  setToVar,
  subject,
  setSubject,
  body,
  setBody,
  focusedField,
  setFocusedField,
  insertVar,
  unknownVars,
}: {
  selectedVarList: string[];
  toVar: string;
  setToVar: (v: string) => void;
  subject: string;
  setSubject: (v: string) => void;
  body: string;
  setBody: (v: string) => void;
  focusedField: "subject" | "body";
  setFocusedField: (f: "subject" | "body") => void;
  insertVar: (v: string) => void;
  unknownVars: string[];
}) {
  const previewSubject = useMemo(
    () => renderLocal(subject, Object.fromEntries(selectedVarList.map((v) => [v, `[${v}]`]))),
    [subject, selectedVarList],
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Write your email</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Click any variable chip to insert it at the end of the focused field.
        </p>
      </div>

      {/* Variable chips */}
      <div className="flex flex-wrap gap-1.5">
        {selectedVarList.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => insertVar(v)}
            className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-0.5 text-xs font-mono hover:bg-neutral-100 dark:hover:bg-neutral-900 transition"
          >
            {`{{${v}}}`}
          </button>
        ))}
      </div>

      {/* To field */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">To (email variable)</label>
        <select
          value={toVar}
          onChange={(e) => setToVar(e.target.value)}
          className={selectCls}
        >
          {selectedVarList.map((v) => (
            <option key={v} value={v}>{`{{${v}}}`}</option>
          ))}
        </select>
        <p className="text-xs text-neutral-400">
          Which variable contains the recipient&apos;s email address.
        </p>
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Subject</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          onFocus={() => setFocusedField("subject")}
          placeholder={`e.g. Quick question for {{${selectedVarList[0] ?? "name"}}}`}
          className={`${inputCls} font-mono text-sm ${focusedField === "subject" ? "border-neutral-900 dark:border-neutral-100" : ""}`}
        />
        {subject && (
          <p className="text-xs text-neutral-500">Preview: {previewSubject}</p>
        )}
      </div>

      {/* Body */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Message body (HTML or plain text)</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onFocus={() => setFocusedField("body")}
          rows={12}
          placeholder={`<p>Hello {{${selectedVarList[0] ?? "name"}}},</p>\n<p>...</p>`}
          className={`${inputCls} font-mono text-xs resize-y ${focusedField === "body" ? "border-neutral-900 dark:border-neutral-100" : ""}`}
        />
      </div>

      {unknownVars.length > 0 && (
        <div className="rounded-md border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 px-4 py-3">
          <p className="text-sm text-red-700 dark:text-red-400 font-medium">Unknown variables</p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {unknownVars.map((v) => `{{${v}}}`).join(", ")} — not in your selected columns. Fix or remove them.
          </p>
        </div>
      )}
    </div>
  );
}

// ---- Review step ----

function ReviewStep({
  name,
  smtpEmail,
  listName,
  listSize,
  listId,
  subject,
  body,
  toVar,
  launchNow,
  setLaunchNow,
}: {
  name: string;
  smtpEmail?: string;
  listName?: string;
  listSize?: number;
  listId: string;
  subject: string;
  body: string;
  toVar: string;
  launchNow: boolean;
  setLaunchNow: (v: boolean) => void;
}) {
  const previewQ = useQuery({
    queryKey: ["campaign-preview", listId, subject, body, toVar],
    queryFn: () =>
      previewCampaignContent({
        contact_list_id: listId,
        subject,
        html_body: body,
        to_variable: toVar,
      }),
    staleTime: 30_000,
  });

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const autoResize = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) iframe.style.height = `${doc.documentElement.scrollHeight}px`;
    } catch {
      // cross-origin guard
    }
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.style.height = "200px";
    const onLoad = () => autoResize();
    iframe.addEventListener("load", onLoad);
    return () => iframe.removeEventListener("load", onLoad);
  }, [previewQ.data?.html_body, autoResize]);

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Review & launch</h2>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <Row label="Campaign" value={name} />
        <Row label="Sender" value={smtpEmail} mono />
        <Row label="List" value={listName ? `${listName} · ${listSize ?? 0} recipients` : undefined} />
        <Row label="To variable" value={toVar ? `{{${toVar}}}` : undefined} mono />
      </dl>

      <section className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <header className="bg-neutral-50 dark:bg-neutral-900/50 px-4 py-2 text-xs uppercase text-neutral-500">
          Preview (first contact from list)
        </header>
        {previewQ.isLoading && <p className="px-4 py-3 text-sm">Loading preview…</p>}
        {previewQ.error && <p className="px-4 py-3 text-sm text-red-500">Preview unavailable</p>}
        {previewQ.data && (
          <>
            <div className="px-5 py-3 border-b border-neutral-200 dark:border-neutral-800 text-sm space-y-1">
              <div>
                <span className="text-xs text-neutral-500">To: </span>
                <span className="font-mono text-xs">{previewQ.data.to}</span>
              </div>
              <div>
                <span className="text-xs text-neutral-500">Subject: </span>
                <span className="font-medium">{previewQ.data.subject}</span>
              </div>
            </div>
            <iframe
              ref={iframeRef}
              srcDoc={`<style>html,body{background:#0a0a0a;color:#e5e5e5;margin:0;padding:8px;font-family:sans-serif}a{color:#a3a3a3}</style>${previewQ.data.html_body}`}
              title="Email preview"
              sandbox="allow-same-origin"
              onLoad={autoResize}
              className="w-full min-h-[200px] border-0 block"
              style={{ height: 200 }}
            />
          </>
        )}
      </section>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={launchNow}
          onChange={(e) => setLaunchNow(e.target.checked)}
          className="h-4 w-4 accent-neutral-900 dark:accent-neutral-100"
        />
        Queue for sending immediately. Uncheck to keep as draft.
      </label>
    </div>
  );
}

// ---- small components ----

function Row({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs uppercase text-neutral-500">{label}</dt>
      <dd className={mono ? "font-mono" : ""}>{value ?? "—"}</dd>
    </div>
  );
}

function PickRow({
  selected,
  onClick,
  title,
  subtitle,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition ${
        selected
          ? "border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-900/40"
          : "border-neutral-300 dark:border-neutral-700"
      }`}
    >
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-neutral-500 font-mono mt-0.5">{subtitle}</div>
      </div>
      <span
        className={`h-4 w-4 rounded-full border shrink-0 ${
          selected
            ? "border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100"
            : "border-neutral-400"
        }`}
      />
    </button>
  );
}

function NoneAvailable({ message, cta, href }: { message: string; cta: string; href: string }) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 px-4 py-6 text-center">
      <p className="text-sm text-neutral-500 mb-2">{message}</p>
      <Link href={href} className="text-sm underline">{cta} →</Link>
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:focus:border-neutral-200";

const selectCls =
  "w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:focus:border-neutral-200 font-mono";
