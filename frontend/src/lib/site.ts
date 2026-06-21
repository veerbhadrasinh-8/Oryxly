/**
 * Marketing site configuration: brand metadata, navigation, and plan data.
 *
 * Plan limits mirror the backend source of truth in `backend/app/core/plans.py`.
 * Prices are the canonical INR figures from the PRD. Keep both in sync when the
 * backend plan limits change.
 */

/** Absolute base URL of the public site, used for canonical/OG/sitemap URLs. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://oryxly.in";

export const SITE_NAME = "ORYXLY";
export const SITE_TAGLINE = "Email Marketing & Campaign Tool for India";
export const SITE_DESCRIPTION =
  "ORYXLY is an email marketing and campaign tool for Indian SMBs, exporters, recruiters, and agencies. Connect your own SMTP, upload contacts, personalize with variables, and send bulk email campaigns with built-in throttling, retries, and delivery logs.";

/** Short description for meta tags — 150–160 chars, keyword-dense. */
export const SITE_META_DESCRIPTION =
  "Email marketing software for India. Send bulk email campaigns via your own SMTP — no shared IPs, no per-email fees. Upload contacts, personalize, and track every delivery.";

/** Primary keywords seeded into metadata for organic discovery. */
export const SITE_KEYWORDS = [
  "email campaign tool",
  "email marketing tool India",
  "email marketing software",
  "email campaign software India",
  "bulk email tool",
  "email automation tool",
  "email outreach software",
  "SMTP email marketing",
  "bulk email through own SMTP",
  "email marketing for SMB India",
  "Zoho Campaigns alternative",
  "Mailchimp alternative India",
  "cold email tool for exporters",
  "recruiter outreach email tool",
  "agency email sending platform",
  "personalized email campaigns",
  "email campaign platform",
  "affordable email marketing India",
  "email marketing without shared IP",
  "send bulk email India",
];

export const ORG_NAME = "Oryxus";
export const ORG_URL = "https://oryxus.in";
export const CONTACT_EMAIL = "oryxusofficial@gmail.com";

/** Public marketing routes that render their own header/footer chrome. */
export const MARKETING_PATHS = [
  "/",
  "/features",
  "/pricing",
  "/faq",
  "/about",
  "/contact",
  "/guide",
] as const;

/** True when `pathname` is a public marketing page (own chrome, no app nav). */
export function isMarketingPath(pathname: string): boolean {
  return (
    (MARKETING_PATHS as readonly string[]).includes(pathname) ||
    pathname.startsWith("/compare")
  );
}

/** Marketing top-nav links (public pages). */
export const MARKETING_NAV = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/compare", label: "Compare" },
  { href: "/guide", label: "Guide" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export type Plan = {
  name: string;
  price: string;
  period: string;
  tagline: string;
  popular?: boolean;
  features: string[];
};

/** Pricing cards. Limits sourced from backend/app/core/plans.py. */
export const PLANS: Plan[] = [
  {
    name: "Starter",
    price: "₹1,499",
    period: "/month",
    tagline: "For solo senders getting off the ground.",
    features: [
      "1 SMTP connection",
      "5,000 contacts",
      "5,000 emails / month",
      "5 campaigns / month",
      "Personalization variables",
      "Delivery logs & retries",
    ],
  },
  {
    name: "Growth",
    price: "₹3,499",
    period: "/month",
    tagline: "For teams scaling outreach.",
    popular: true,
    features: [
      "3 SMTP connections",
      "25,000 contacts",
      "30,000 emails / month",
      "Unlimited campaigns",
      "Personalization variables",
      "Priority delivery logs",
    ],
  },
  {
    name: "Agency",
    price: "₹12,999",
    period: "/month",
    tagline: "For agencies running client campaigns.",
    features: [
      "10 SMTP connections",
      "Unlimited contacts",
      "150,000 emails / month",
      "Unlimited campaigns",
      "Team access",
      "Audit-grade logs",
    ],
  },
];

export const FAQS = [
  {
    q: "How does ORYXLY send emails?",
    a: "You connect your own SMTP credentials. Every campaign is queued and sent through your infrastructure with a minimum 4-second delay between messages, automatic retries, and full delivery logging. ORYXLY never sends on your behalf from shared IPs.",
  },
  {
    q: "Is my SMTP password safe?",
    a: "Yes. SMTP credentials are encrypted at rest and are never returned in any API response. They are only decrypted inside the sending worker at the moment a campaign runs.",
  },
  {
    q: "Can I personalize emails?",
    a: "Yes. Upload a CSV or XLSX contact list and reference any column as a variable in your subject and body. ORYXLY renders a live preview against a sample contact before you launch.",
  },
  {
    q: "What file formats are supported?",
    a: "Contacts can be uploaded as CSV, XLSX, or XLS (up to 10 MB). Attachments can be PDF, DOCX, PNG, or JPG.",
  },
  {
    q: "Do you deduplicate contacts?",
    a: "Yes. Uploaded lists are validated and deduplicated automatically so you never email the same address twice in one list.",
  },
  {
    q: "Who is ORYXLY for?",
    a: "Indian SMBs, exporters, recruiters, and agencies who want reliable, personalized email outreach through their own SMTP - without per-email pricing or shared-IP reputation risk.",
  },
  {
    q: "Is ORYXLY an alternative to Zoho Campaigns?",
    a: "Yes. Unlike Zoho Campaigns, ORYXLY routes your emails through your own SMTP server — so you control the sending domain, IP reputation, and deliverability. There are no per-email charges; you pay a flat monthly fee for the platform.",
  },
  {
    q: "How is ORYXLY different from Mailchimp?",
    a: "Mailchimp sends from their shared IP pools and charges per contact or per email sent. ORYXLY lets you send through your own Gmail, Outlook, Zoho Mail, or SendGrid account — which means no shared-IP reputation risk and no per-email fees, making it far more affordable for high-volume senders in India.",
  },
  {
    q: "What is SMTP email marketing?",
    a: "SMTP email marketing means sending your email campaigns through an SMTP server you own or control — such as Gmail, Outlook, Zoho Mail, or a transactional provider like SendGrid. Because you own the sending infrastructure, your deliverability and sender reputation are entirely in your hands.",
  },
  {
    q: "How many emails can I send per day?",
    a: "Daily send limits depend on your ORYXLY plan and your SMTP provider's own limits. The Starter plan supports up to 5,000 emails per month, Growth up to 30,000, and Agency up to 150,000. Your SMTP provider (e.g. Gmail at 500/day, SendGrid at 100/day free) may impose additional limits.",
  },
  {
    q: "Can I send bulk email through Gmail with ORYXLY?",
    a: "Yes. Add your Gmail account as an SMTP connection using a 16-character App Password (generated in your Google Account security settings). ORYXLY will send campaigns through that Gmail account with a minimum 4-second delay between messages to protect your sender reputation.",
  },
  {
    q: "Do I need coding skills to use ORYXLY?",
    a: "No. ORYXLY is a no-code email campaign tool. You upload a CSV or XLSX contact list, write your subject and body with point-and-click variable insertion, and launch — no technical knowledge required beyond having an SMTP account.",
  },
  {
    q: "Is ORYXLY suitable for cold email outreach?",
    a: "ORYXLY is well-suited for personalized B2B outreach: exporters reaching buyers, recruiters contacting candidates, and agencies sending on behalf of clients. Campaigns send through your own domain with per-recipient personalization and throttled delivery to protect reputation.",
  },
  {
    q: "What is the pricing for ORYXLY?",
    a: "ORYXLY offers three monthly plans in INR: Starter at ₹1,499/month (1 SMTP, 5,000 emails), Growth at ₹3,499/month (3 SMTPs, 30,000 emails), and Agency at ₹12,999/month (10 SMTPs, 150,000 emails). All plans include personalization, deduplication, throttled sending, retries, and delivery logs.",
  },
  {
    q: "How do I get started with email marketing using ORYXLY?",
    a: "Sign up at oryxly.in, add your SMTP credentials (Gmail, Outlook, Zoho Mail, or SendGrid), upload a contact list as CSV or XLSX, write your campaign content with personalization variables, preview against a sample contact, and launch. Most users send their first campaign within 15 minutes.",
  },
];
