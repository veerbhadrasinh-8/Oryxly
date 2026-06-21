import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "How to Send Email Campaigns – Setup Guide for Gmail, Outlook & Zoho Mail",
  description:
    "Step-by-step guide: get an app password for Gmail, Outlook, Zoho Mail, or SendGrid, then upload contacts, personalize, and launch your first bulk email marketing campaign with ORYXLY.",
  alternates: { canonical: "/guide" },
  openGraph: { title: `Email Campaign Setup Guide | ${SITE_NAME}`, url: `${SITE_URL}/guide` },
};

/* ─── types ─────────────────────────────────────────────────────── */

type Step = { title: string; body: string; code?: string };
type Section = {
  id: string;
  label: string;
  icon: string;
  intro: string;
  steps: Step[];
  warning?: string;
};

/* ─── data ───────────────────────────────────────────────────────── */

const SMTP_GUIDES: Section[] = [
  {
    id: "gmail",
    label: "Gmail (Google)",
    icon: "G",
    intro:
      "Google blocks regular password login for third-party apps. You need a 16-character App Password - it bypasses 2-Step Verification for a single app.",
    warning:
      "2-Step Verification must be enabled on your Google Account before App Passwords appear.",
    steps: [
      {
        title: "Enable 2-Step Verification",
        body: "Go to myaccount.google.com → Security → 2-Step Verification. Complete the setup if you haven't already.",
      },
      {
        title: "Open App Passwords",
        body: 'Search "App Passwords" in the Google Account search bar (or go to myaccount.google.com → Security → App Passwords). Sign in again if prompted.',
      },
      {
        title: "Create a new App Password",
        body: 'Under "Select app" choose Mail. Under "Select device" choose Other and type "ORYXLY". Click Generate.',
      },
      {
        title: "Copy the 16-character password",
        body: "Google shows the password once. Copy it now - you cannot see it again.",
      },
      {
        title: "Add SMTP in ORYXLY",
        body: "Go to SMTP → Add connection. Use these settings:",
        code:
          "Host:  smtp.gmail.com\nPort:  587\nTLS:   STARTTLS\nUser:  your@gmail.com\nPass:  (the 16-character app password)",
      },
    ],
  },
  {
    id: "outlook",
    label: "Outlook / Microsoft 365",
    icon: "O",
    intro:
      "Microsoft accounts support SMTP AUTH but it must be enabled on your tenant. Use an App Password when MFA is active.",
    warning:
      "If your organisation uses Conditional Access, an admin may need to exempt SMTP AUTH for your account.",
    steps: [
      {
        title: "Check SMTP AUTH is on",
        body: "Ask your M365 admin to confirm SMTP AUTH is enabled for your mailbox (Exchange Admin Center → Users → your mailbox → Mail → SMTP AUTH).",
      },
      {
        title: "Generate an App Password (MFA accounts only)",
        body: "Go to account.microsoft.com → Security → Advanced security options → App passwords → Create a new app password. Copy the generated password.",
      },
      {
        title: "Add SMTP in ORYXLY",
        body: "Use these settings for personal Outlook or Microsoft 365:",
        code:
          "Host:  smtp.office365.com\nPort:  587\nTLS:   STARTTLS\nUser:  your@outlook.com\nPass:  (app password or account password if no MFA)",
      },
      {
        title: "For Hotmail / Outlook.com",
        body: "Settings are identical - same host, port, and TLS. Just replace the email with your @hotmail.com or @outlook.com address.",
      },
    ],
  },
  {
    id: "zoho",
    label: "Zoho Mail",
    icon: "Z",
    intro:
      "Zoho Mail supports SMTP for both free and paid plans. Use an application-specific password when two-factor authentication is enabled.",
    steps: [
      {
        title: "Enable Two-Factor Authentication (optional but recommended)",
        body: "accounts.zoho.com → Security → Two-Factor Authentication → Set up now.",
      },
      {
        title: "Generate Application Password",
        body: "accounts.zoho.com → Security → App Passwords → Generate New Password. Name it ORYXLY and copy the password shown.",
      },
      {
        title: "Add SMTP in ORYXLY",
        body: "Use these settings:",
        code:
          "Host:  smtp.zoho.in   (India)  or  smtp.zoho.com  (global)\nPort:  587\nTLS:   STARTTLS\nUser:  your@zoho.in\nPass:  (app password)",
      },
      {
        title: "Verify with a test send",
        body: "ORYXLY sends a test email to your address when you save the connection. Check your inbox to confirm delivery.",
      },
    ],
  },
  {
    id: "sendgrid",
    label: "SendGrid",
    icon: "SG",
    intro:
      "SendGrid exposes a full SMTP relay. You authenticate with your account username and an API key as the password - no app-password flow needed.",
    steps: [
      {
        title: "Create an API Key",
        body: "Log in at app.sendgrid.com → Settings → API Keys → Create API Key. Choose Restricted Access, enable only Mail Send → Full Access. Copy the key - it is shown once.",
      },
      {
        title: "Add SMTP in ORYXLY",
        body: "Use these exact settings:",
        code:
          "Host:  smtp.sendgrid.net\nPort:  587\nTLS:   STARTTLS\nUser:  apikey            ← literal string, not your email\nPass:  SG.xxxxxxxxxxxx   ← your API key",
      },
      {
        title: "Verify sender identity",
        body: "SendGrid requires your From address to be verified. Go to Settings → Sender Authentication and either verify a single sender or authenticate a whole domain.",
      },
      {
        title: "Check sending limits",
        body: "Free SendGrid accounts are capped at 100 emails/day. Ensure your SendGrid plan covers the volume you intend to send through ORYXLY.",
      },
    ],
  },
];

const PRODUCT_GUIDES: Section[] = [
  {
    id: "product-smtp",
    label: "1 - Connect your SMTP",
    icon: "①",
    intro: "SMTP is the engine ORYXLY uses to deliver your campaigns. You must add at least one connection before creating a campaign.",
    steps: [
      {
        title: "Go to SMTP",
        body: "Open the SMTP page from the top navigation inside your dashboard.",
      },
      {
        title: "Add a connection",
        body: "Click Add connection. Enter the host, port, username, and password for your provider. Choose STARTTLS on port 587 (recommended) or SSL/TLS on port 465.",
      },
      {
        title: "Test the connection",
        body: "ORYXLY sends a test email to your own address immediately after you save. If it fails, check credentials and that SMTP AUTH is enabled for your account.",
      },
      {
        title: "Add more connections (Growth/Agency)",
        body: "Growth plans allow 3 connections; Agency allows 10. You can round-robin across them in future campaigns.",
      },
    ],
  },
  {
    id: "product-contacts",
    label: "2 - Upload contacts",
    icon: "②",
    intro: "ORYXLY accepts contact lists as CSV, XLSX, or XLS files up to 10 MB. Each file becomes a named list you can reuse across campaigns.",
    steps: [
      {
        title: "Prepare your file",
        body: "Your file must have a header row. Include at minimum an email column. Add any other columns you want to use as personalisation variables (e.g. first_name, company, position).",
        code: "email,first_name,company\njohn@example.com,John,Acme\njane@example.com,Jane,Beta Co",
      },
      {
        title: "Upload the list",
        body: "Go to Contacts → Upload. Name the list and select your file. ORYXLY validates every row and removes duplicates automatically.",
      },
      {
        title: "Review the import",
        body: "After upload you see a count of valid, duplicate, and invalid rows. Invalid rows (missing or malformed emails) are skipped and logged.",
      },
    ],
  },
  {
    id: "product-campaigns",
    label: "3 - Create a campaign",
    icon: "③",
    intro: "A campaign ties together a sender, a contact list, and your email content. The 6-step wizard walks you through each part.",
    steps: [
      {
        title: "Name your campaign",
        body: "Give it an internal name you'll recognise in your logs (e.g. 'Q3 export outreach - July').",
      },
      {
        title: "Choose a sender",
        body: "Select one of your verified SMTP connections as the sending account.",
      },
      {
        title: "Select your audience",
        body: "Pick a contact list. ORYXLY shows a preview row count.",
      },
      {
        title: "Map variables",
        body: "ORYXLY detects the columns in your list. Choose which column is the recipient email address (the 'to' variable).",
      },
      {
        title: "Write your content",
        body: "Write the subject line and HTML body. Reference any list column with double curly braces:",
        code: "Subject: Hey {{first_name}}, a quick note about {{company}}\nBody:    Hi {{first_name}}, ...",
      },
      {
        title: "Review and launch",
        body: "The review step renders a live preview with a real contact row. When you're happy, click Launch. The campaign enters the queue and workers begin sending.",
      },
    ],
  },
  {
    id: "product-logs",
    label: "4 - Read delivery logs",
    icon: "④",
    intro: "Every message ORYXLY attempts to send gets a log entry. Use Logs to track delivery, diagnose failures, and audit sends.",
    steps: [
      {
        title: "Find the Logs page",
        body: "Click Logs in the top navigation. You see all messages across all campaigns, newest first.",
      },
      {
        title: "Understand status values",
        body: "sent - delivered to your SMTP server.\nfailed - all retries exhausted; expand the row to see the SMTP error.\npending - queued, not yet attempted.",
      },
      {
        title: "Debug a failed send",
        body: "Click any failed row to expand it. The full SMTP error response is shown - e.g. 'Invalid credentials' or '550 5.1.1 recipient not found'. Fix the root cause (credentials, recipient address) and re-launch if needed.",
      },
    ],
  },
  {
    id: "product-pause",
    label: "5 - Pause or stop a campaign",
    icon: "⑤",
    intro: "You can pause a running campaign or cancel it entirely from the campaign detail page.",
    steps: [
      {
        title: "Open the campaign",
        body: "Go to Campaigns and click the campaign name.",
      },
      {
        title: "Pause sending",
        body: "Click Pause. Workers stop picking up new messages for that campaign. Queued messages not yet attempted stay in the queue.",
      },
      {
        title: "Resume or cancel",
        body: "Click Resume to continue from where you left off. Click Cancel to mark the campaign cancelled - remaining queued messages are discarded.",
      },
    ],
  },
];

/* ─── components ─────────────────────────────────────────────────── */

function SectionCard({ s }: { s: Section }) {
  return (
    <div id={s.id} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
        <span className="rounded-lg bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 text-xs font-bold font-mono">
          {s.icon}
        </span>
        <h2 className="text-lg font-semibold">{s.label}</h2>
      </div>
      <div className="px-6 py-5 space-y-6">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{s.intro}</p>
        {s.warning && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
            ⚠ {s.warning}
          </div>
        )}
        <ol className="space-y-5">
          {s.steps.map((step, i) => (
            <li key={i} className="flex gap-4">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{step.body}</p>
                {step.code && (
                  <pre className="mt-2 rounded-lg bg-neutral-950 text-emerald-400 text-xs p-4 overflow-x-auto font-mono whitespace-pre">
                    {step.code}
                  </pre>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function TocLink({ id, label }: { id: string; label: string }) {
  return (
    <a
      href={`#${id}`}
      className="block text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 py-1 pl-3 border-l-2 border-neutral-200 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-neutral-100 transition"
    >
      {label}
    </a>
  );
}

/* ─── page ───────────────────────────────────────────────────────── */

export default function GuidePage() {
  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Send Bulk Email Marketing Campaigns with ORYXLY",
    description:
      "Complete step-by-step guide to setting up SMTP and sending personalized bulk email marketing campaigns using your own Gmail, Outlook, Zoho Mail, or SendGrid account.",
    totalTime: "PT15M",
    step: PRODUCT_GUIDES.map((s) => ({
      "@type": "HowToStep",
      name: s.label,
      text: s.intro,
      itemListElement: s.steps.map((step) => ({
        "@type": "HowToDirection",
        text: `${step.title}: ${step.body}`,
      })),
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Guide", item: `${SITE_URL}/guide` },
    ],
  };

  return (
    <MarketingShell>
      <JsonLd data={howToLd} />
      <JsonLd data={breadcrumbLd} />
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Setup Guide</h1>
          <p className="mt-3 text-neutral-500 max-w-2xl mx-auto">
            Get from zero to a live campaign in minutes. Start with getting an app
            password for your email provider, then follow the product walkthrough.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/register"
              className="rounded-md bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 px-5 py-2.5 text-sm font-medium hover:opacity-90"
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-neutral-300 dark:border-neutral-700 px-5 py-2.5 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* TOC sidebar */}
          <aside className="lg:w-56 shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                  App passwords
                </p>
                <div className="space-y-0.5">
                  {SMTP_GUIDES.map((s) => (
                    <TocLink key={s.id} id={s.id} label={s.label} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                  Product walkthrough
                </p>
                <div className="space-y-0.5">
                  {PRODUCT_GUIDES.map((s) => (
                    <TocLink key={s.id} id={s.id} label={s.label} />
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 space-y-6">
            {/* SMTP section group */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 px-6 py-4">
              <h2 className="text-xl font-bold">Getting an app password</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Most email providers block regular password login for third-party
                apps. Generate an app password (or API key) from your provider
                and use that when adding an SMTP connection in ORYXLY.
              </p>
            </div>
            {SMTP_GUIDES.map((s) => <SectionCard key={s.id} s={s} />)}

            {/* Product section group */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 px-6 py-4 mt-10">
              <h2 className="text-xl font-bold">Product walkthrough</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Once your SMTP is connected, follow these steps to send your first
                campaign.
              </p>
            </div>
            {PRODUCT_GUIDES.map((s) => <SectionCard key={s.id} s={s} />)}
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
