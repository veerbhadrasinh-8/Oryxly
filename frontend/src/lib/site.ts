/**
 * Marketing site configuration: brand metadata, navigation, and plan data.
 *
 * Plan limits mirror the backend source of truth in `backend/app/core/plans.py`.
 * Prices are the canonical INR figures from the PRD. Keep both in sync when the
 * backend plan limits change.
 */

/** Absolute base URL of the public site, used for canonical/OG/sitemap URLs. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://oryxly.com";

export const SITE_NAME = "ORYXLY";
export const SITE_TAGLINE = "Email campaigns that send through your own SMTP";
export const SITE_DESCRIPTION =
  "ORYXLY is an email campaign platform for Indian SMBs, exporters, recruiters, and agencies. Connect your own SMTP, upload contacts, personalize with variables, and send reliable campaigns with built-in throttling, retries, and delivery logs.";

/** Primary keywords seeded into metadata for organic discovery. */
export const SITE_KEYWORDS = [
  "email campaign software India",
  "bulk email through own SMTP",
  "SMTP email marketing",
  "cold email tool for exporters",
  "recruiter outreach email tool",
  "agency email sending platform",
  "personalized email campaigns",
  "email marketing for SMB",
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
  return (MARKETING_PATHS as readonly string[]).includes(pathname);
}

/** Marketing top-nav links (public pages). */
export const MARKETING_NAV = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
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
];
