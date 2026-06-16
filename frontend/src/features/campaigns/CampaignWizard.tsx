"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { createCampaign, launchCampaign } from "./api";
import { listSmtp } from "@/features/smtp/api";
import { listTemplates, previewTemplate } from "@/features/templates/api";
import { listContactLists } from "@/features/contacts/api";

const STEPS = ["Name", "Sender", "Audience", "Content", "Review"] as const;
type Step = (typeof STEPS)[number];

export function CampaignWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("Name");

  const [name, setName] = useState("");
  const [smtpId, setSmtpId] = useState<string | null>(null);
  const [listId, setListId] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [launchNow, setLaunchNow] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const smtpQ = useQuery({ queryKey: ["smtp"], queryFn: listSmtp });
  const listQ = useQuery({ queryKey: ["contact-lists"], queryFn: listContactLists });
  const tplQ = useQuery({ queryKey: ["templates"], queryFn: listTemplates });

  const activeSmtps = smtpQ.data?.filter((s) => s.status === "active") ?? [];
  const usableLists = listQ.data?.filter((l) => l.valid_contacts > 0) ?? [];

  // Auto-pick if there's only one option
  useEffect(() => {
    if (activeSmtps.length === 1 && !smtpId) setSmtpId(activeSmtps[0].id);
  }, [activeSmtps, smtpId]);
  useEffect(() => {
    if (usableLists.length === 1 && !listId) setListId(usableLists[0].id);
  }, [usableLists, listId]);

  const createAndMaybeLaunch = useMutation({
    mutationFn: async () => {
      const { campaign_id } = await createCampaign({
        name: name.trim(),
        smtp_account_id: smtpId!,
        contact_list_id: listId!,
        template_id: templateId!,
      });
      if (launchNow) {
        await launchCampaign(campaign_id);
      }
      return campaign_id;
    },
    onSuccess: (id) => router.push(`/campaigns/${id}`),
    onError: (err) => {
      if (isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        if (typeof detail === "string") return setError(detail);
        if (!err.response) {
          return setError(
            `Network error: ${err.message}. The campaign may have been created on the server — check /campaigns before retrying.`,
          );
        }
        return setError(`Request failed (${err.response.status})`);
      }
      setError("Failed");
    },
  });

  function canAdvance(): boolean {
    switch (step) {
      case "Name":
        return name.trim().length > 0;
      case "Sender":
        return !!smtpId;
      case "Audience":
        return !!listId;
      case "Content":
        return !!templateId;
      case "Review":
        return true;
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
  const chosenTemplate = tplQ.data?.find((t) => t.id === templateId);

  return (
    <div className="space-y-6">
      <ol className="flex gap-3 text-xs">
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
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
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
            <p className="text-sm text-neutral-500">
              Internal only — recipients won&apos;t see this.
            </p>
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
            <p className="text-sm text-neutral-500">
              Only verified SMTP accounts are eligible.
            </p>
            {smtpQ.isLoading && <p className="text-sm">Loading SMTP accounts…</p>}
            {smtpQ.data && activeSmtps.length === 0 && (
              <NoneAvailable
                message="No verified SMTP accounts."
                cta="Add one"
                href="/smtp"
              />
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
            {listQ.isLoading && <p className="text-sm">Loading lists…</p>}
            {listQ.data && usableLists.length === 0 && (
              <NoneAvailable
                message="No contact lists with valid recipients."
                cta="Upload contacts"
                href="/contacts"
              />
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

        {step === "Content" && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Pick template</h2>
            {tplQ.isLoading && <p className="text-sm">Loading templates…</p>}
            {tplQ.data && tplQ.data.length === 0 && (
              <NoneAvailable
                message="No templates yet."
                cta="Create one"
                href="/templates/new"
              />
            )}
            <div className="space-y-2">
              {tplQ.data?.map((t) => (
                <PickRow
                  key={t.id}
                  selected={templateId === t.id}
                  onClick={() => setTemplateId(t.id)}
                  title={t.name}
                  subtitle={t.subject}
                />
              ))}
            </div>
          </section>
        )}

        {step === "Review" && (
          <ReviewStep
            name={name}
            smtpEmail={chosenSmtp?.email}
            listName={chosenList?.name}
            listSize={chosenList?.valid_contacts}
            templateId={templateId!}
            templateName={chosenTemplate?.name}
            launchNow={launchNow}
            setLaunchNow={setLaunchNow}
          />
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center justify-between">
        {step !== "Name" ? (
          <button
            type="button"
            onClick={back}
            className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm"
          >
            ← Back
          </button>
        ) : (
          <Link
            href="/campaigns"
            className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm"
          >
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
            {createAndMaybeLaunch.isPending
              ? "Creating…"
              : launchNow
                ? "Create & launch"
                : "Save draft"}
          </button>
        )}
      </div>
    </div>
  );
}

function ReviewStep({
  name,
  smtpEmail,
  listName,
  listSize,
  templateId,
  templateName,
  launchNow,
  setLaunchNow,
}: {
  name: string;
  smtpEmail?: string;
  listName?: string;
  listSize?: number;
  templateId: string;
  templateName?: string;
  launchNow: boolean;
  setLaunchNow: (v: boolean) => void;
}) {
  const previewQ = useQuery({
    queryKey: ["template-preview", templateId],
    queryFn: () => previewTemplate(templateId),
  });

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Review & launch</h2>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <Row label="Campaign" value={name} />
        <Row label="Sender" value={smtpEmail} mono />
        <Row label="List" value={`${listName} · ${listSize} recipients`} />
        <Row label="Template" value={templateName} />
      </dl>

      <section className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <header className="bg-neutral-50 dark:bg-neutral-900/50 px-4 py-2 text-xs uppercase text-neutral-500">
          Preview (sample contact)
        </header>
        {previewQ.isLoading && <p className="px-4 py-3 text-sm">Loading…</p>}
        {previewQ.data && (
          <>
            <div className="px-5 py-3 border-b border-neutral-200 dark:border-neutral-800 text-sm">
              <div className="text-xs text-neutral-500">Subject</div>
              <div className="font-medium">{previewQ.data.subject}</div>
            </div>
            <div
              className="px-5 py-4 text-sm [&_p]:my-2"
              dangerouslySetInnerHTML={{ __html: previewQ.data.html_body }}
            />
          </>
        )}
      </section>

      <label className="flex items-center gap-2 text-sm">
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
        className={`h-4 w-4 rounded-full border ${
          selected
            ? "border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100"
            : "border-neutral-400"
        }`}
      />
    </button>
  );
}

function NoneAvailable({
  message,
  cta,
  href,
}: {
  message: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 px-4 py-6 text-center">
      <p className="text-sm text-neutral-500 mb-2">{message}</p>
      <Link href={href} className="text-sm underline">
        {cta} →
      </Link>
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:focus:border-neutral-200";
