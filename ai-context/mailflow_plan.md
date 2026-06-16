# MailFlow — Complete Strategic Business & Build Plan
**Prepared by: Business Strategy + Product Architecture**
**Date: May 2026 | Version: 1.0**

---

## PART 1 — MARKET REALITY CHECK

### Who You're Actually Competing With

This is the most important section. Read it before writing a single line of code.

#### Global Competition (The Giants)

| Tool | Pricing (USD/mo) | In INR | Model |
|---|---|---|---|
| Instantly.ai | $30–$97 | ₹2,500–₹8,100 | BYO SMTP + their infra |
| Smartlead | $39–$174 | ₹3,250–₹14,500 | BYO SMTP + their infra |
| Lemlist | $79–$109/user | ₹6,600–₹9,100 | Their infra |
| Mailchimp | $20–$135 | ₹1,700–₹11,200 | Their infra |
| Brevo | $9–$499 | ₹750–₹41,600 | Their infra |
| MailerLite | $10–$20 | ₹835–₹1,670 | Their infra |

#### Indian Competition (Direct)

| Tool | Pricing | Model | Weakness |
|---|---|---|---|
| Netcore Cloud | Enterprise, custom INR | Their infra | Complex, not for SMB |
| CampaignHQ | INR plans on AWS SES | Their infra | No BYO SMTP |
| Time4Servers | Custom quotes | Their SMTP | Agency-focused, not self-serve |
| Zoho Campaigns | ₹900–₹4,500/mo | Their infra | Overkill for outbound |

### The Gap Nobody Is Filling

Here is the exact gap your product fits:

```
GLOBAL TOOLS (Instantly, Smartlead):
✓ BYO SMTP
✗ USD pricing (foreign exchange risk for Indian SMBs)
✗ Complex UI (non-technical teams can't use)
✗ Made for US/EU sales teams, not Indian exporters

INDIAN TOOLS (Zoho, Netcore, CampaignHQ):
✓ INR pricing
✗ Their SMTP infrastructure (you pay per email)
✗ B2C/newsletter focused, not B2B outbound
✗ Feature-heavy, slow onboarding

YOUR PRODUCT:
✓ INR pricing
✓ BYO SMTP (Gmail App Password locked per account)
✓ Simple: upload Excel → pick template → send
✓ Built for exporters, recruiters, SMBs in India
✓ Non-technical friendly
```

**This gap is real. No tool in India does exactly this.**

---

## PART 2 — THE PRICING ARGUMENT (DEFINITIVE)

### Why ₹600–700 Will Kill You

This is not an opinion. It is math.

#### Scenario A: ₹700/month

```
5 clients        = ₹3,500/month revenue
Infrastructure   = ₹2,500/month (Railway + Vercel + R2)
Net margin       = ₹1,000/month

One client needs 2 hours support    = ₹0 margin
One Railway invoice spike           = Loss
One bad debt/chargeback             = Negative
```

At ₹700, you are doing free work for 5 companies.

#### Scenario B: ₹1,499/month (recommended floor)

```
5 clients        = ₹7,495/month revenue
Infrastructure   = ₹2,500/month
Net margin       = ₹4,995/month (~67% gross margin)

Even with support hours and bugs: still profitable.
```

#### Why ₹700 Also Destroys Perceived Value

Your ICP (exporters, agencies, recruiters) regularly pays:
- Tally license: ₹18,000/year
- IndiaMART listings: ₹30,000–₹1,00,000/year
- Justdial ads: ₹10,000–₹50,000/year

A ₹700 tool signals: "this might disappear in 3 months."
A ₹1,499 tool signals: "this is a real product."

### Recommended Pricing Structure

#### Plan 1 — Starter ₹1,499/month

- 1 Gmail/SMTP account (locked per subscription)
- Up to 2,000 contacts per campaign
- 5 campaigns/month
- CSV + Google Sheets upload
- Basic personalization: `{{name}}`, `{{company}}`
- Email log (sent/failed/pending)
- Standard support (48hr response)

**Target: First 5 clients. Small exporters, solo recruiters.**

---

#### Plan 2 — Growth ₹3,499/month

- 3 SMTP accounts
- Up to 15,000 contacts
- Unlimited campaigns
- PDF/DOCX attachments (up to 10MB)
- Advanced template variables
- Campaign scheduling
- Priority support (24hr response)

**Target: Agencies, mid-size B2B companies.**

---

#### Plan 3 — Agency ₹7,999/month

- 10 SMTP accounts
- Multiple team members
- White-label option (future)
- Custom domain email (future)
- Dedicated onboarding call
- Priority phone/WhatsApp support

**Target: Recruitment agencies, export houses, B2B marketing agencies.**

---

### Annual Billing Incentive (Add Later)

Offer 2 months free on annual payment:
- Starter annual: ₹14,990 (save ₹2,998)
- This improves cash flow and reduces churn

---

## PART 3 — YOUR UNIQUE BUSINESS MODEL EXPLAINED

### The "One SMTP Per Account" Lock — Why This Is Genius

Competitors like Instantly and Smartlead let users connect unlimited inboxes. That sounds better but creates problems:

- **Deliverability abuse**: Users rotate 50 inboxes, spam at scale, get domains blacklisted
- **Complexity**: Non-technical users get confused managing multiple accounts
- **Support overhead**: More accounts = more issues per customer

**Your model:**
```
User pays ₹1,499 → Registers their Gmail (or SMTP)
→ That account is locked to this subscription
→ Cannot be changed (prevents misuse/account sharing)
→ One account, one purpose, clean accountability
```

**This is actually a selling point, not a limitation:**
- "Your dedicated email account, used only for your campaigns"
- It protects their domain reputation
- It gives you abuse control without complex systems
- It's a natural upgrade path: want 3 email accounts? Move to Growth plan

### The Excel/Google Sheets → Email Flow

This is your core user journey. Keep it brutally simple:

```
Step 1: User uploads Excel/Google Sheet
         Columns: name | company | email | [custom fields]

Step 2: System parses contacts, shows preview
         "Found 247 valid contacts, 3 invalid (shown in red)"

Step 3: User selects/creates template
         "Dear {{name}}, I'm reaching out from {{company}}..."

Step 4: User clicks "Send Campaign"
         System queues → sends 1 email every 4 seconds
         → Log updates in real-time

Step 5: User sees results
         Sent: 241 | Failed: 6 | Reasons shown for failures
```

That's it. No funnels, no A/B tests, no automations. Just this, done perfectly.

---

## PART 4 — TECH STACK DECISION (SIMPLIFIED)

### Your Stack (Final Recommendation)

```
Frontend:   Next.js 15 + TypeScript + TailwindCSS + shadcn/ui
Backend:    FastAPI (Python) — handles auth, campaign mgmt, file parsing
Queue:      Redis + Celery — handles all email sending (non-blocking)
Database:   PostgreSQL (Railway managed)
File Store: Cloudflare R2 (for attachments) — NOT local disk
Hosting:    Vercel (frontend) + Railway (backend + workers + Redis + DB)
```

### On n8n Integration

n8n running locally via Docker is great for **your internal automation** (e.g., alerting yourself when a new user signs up, backing up campaign logs) — but **do NOT expose n8n to end users** in the MVP. Reasons:

1. Local Docker = not HA (high availability), will go down
2. Non-technical clients cannot use n8n
3. It adds complexity to onboarding
4. Your FastAPI + Celery setup already replaces what n8n would do for email sending

**Keep n8n as your internal DevOps tool. Ship it to clients later in Phase 3 as a premium "automation" feature with cloud-hosted n8n.**

### Why NOT to Use Local Disk for Attachments

Railway resets disk on every redeploy. Your users will upload a PDF, you deploy a bug fix, their PDF is gone. Use Cloudflare R2 from Day 1. It has a generous free tier (10GB, 1M requests/month) and is S3-compatible — your code will work exactly the same as S3 later.

---

## PART 5 — BUILD SEQUENCE (REALISTIC, NOT FANTASY)

### Phase 0 — Before Writing Code (Days 1–2)

- [ ] Set up Railway project (Postgres + Redis instances)
- [ ] Set up Cloudflare R2 bucket
- [ ] Set up Vercel project (connect GitHub repo)
- [ ] Create env variable template (never commit secrets)
- [ ] Register domain (if not done): mailflow.in or mailflowapp.com
- [ ] Set up Fernet encryption key for SMTP credential storage

```python
# One-time: generate your Fernet key
from cryptography.fernet import Fernet
key = Fernet.generate_key()
# Store this in Railway env vars as FERNET_KEY
# NEVER put it in the database
```

---

### Phase 1 — Backend Core (Days 3–5)

#### Day 3: Auth + Database

Models to build first:

```python
# users table
class User(Base):
    id, email, hashed_password, plan_type, is_active
    created_at, smtp_account_id (FK, nullable)

# smtp_credentials table  
class SmtpCredential(Base):
    id, user_id (FK), email_address
    encrypted_password  # Fernet encrypted, NEVER plain text
    smtp_host, smtp_port, is_verified
    created_at, last_tested_at

# campaigns table
class Campaign(Base):
    id, user_id (FK), name, status
    template_id (FK), smtp_credential_id (FK)
    total_recipients, sent_count, failed_count
    scheduled_at, started_at, completed_at

# campaign_recipients table
class CampaignRecipient(Base):
    id, campaign_id (FK), email
    name, company, custom_fields (JSON)
    status  # queued | sent | failed | skipped
    error_message, sent_at

# templates table
class Template(Base):
    id, user_id (FK), name
    subject, html_body, text_body
    variables (JSON array)  # detected variables

# email_logs table
class EmailLog(Base):
    id, campaign_recipient_id (FK)
    status, smtp_response, attempted_at
```

Auth endpoints:
```
POST /auth/register
POST /auth/login        → returns JWT + httpOnly cookie
POST /auth/refresh
POST /auth/logout
GET  /auth/me
```

#### Day 4: SMTP Management

This is the most critical security layer.

```python
# Encryption helper
from cryptography.fernet import Fernet
import os

FERNET_KEY = os.getenv("FERNET_KEY")
fernet = Fernet(FERNET_KEY)

def encrypt_password(plain: str) -> str:
    return fernet.encrypt(plain.encode()).decode()

def decrypt_password(encrypted: str) -> str:
    return fernet.decrypt(encrypted.encode()).decode()
```

SMTP endpoints:
```
POST /smtp/connect       → save + test + encrypt credentials
GET  /smtp/test          → test live connection
GET  /smtp/status        → returns masked info (never raw password)
DELETE /smtp/disconnect  → user can't change, only admin can reset
```

SMTP test logic:
```python
async def test_smtp_connection(host, port, email, password):
    try:
        with smtplib.SMTP(host, port, timeout=10) as server:
            server.starttls()
            server.login(email, password)
        return {"status": "connected", "message": "SMTP verified"}
    except smtplib.SMTPAuthenticationError:
        return {"status": "failed", "message": "Wrong email or app password"}
    except Exception as e:
        return {"status": "failed", "message": str(e)}
```

#### Day 5: File Upload + Contact Parsing

This is where most bugs live. Build it carefully.

```python
# Accept: .xlsx, .xls, .csv, Google Sheets URL
# Required columns: email (mandatory), name, company (optional but expected)
# Validation rules:
#   - Valid email format check
#   - Dedup by email within the file
#   - Max 2,000 rows on Starter plan
#   - Warn on missing 'name' column (personalization won't work)

# Return to frontend:
{
  "total": 300,
  "valid": 287,
  "invalid": 13,
  "duplicates": 5,
  "preview": [first 5 rows],
  "columns_detected": ["email", "name", "company", "city"],
  "invalid_rows": [{"row": 14, "email": "bademail", "reason": "Invalid format"}]
}
```

Dependencies needed:
```
pandas          # CSV/Excel parsing
openpyxl        # .xlsx support
email-validator # validate each address
gspread         # Google Sheets API (optional, add later)
```

---

### Phase 2 — Email Engine (Days 6–7)

#### The Celery Worker (Most Critical Piece)

```python
# celery_app.py
from celery import Celery
import time, smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

celery = Celery('mailflow', broker='redis://localhost:6379/0')

@celery.task(bind=True, max_retries=3)
def send_single_email(self, recipient_id: int):
    # 1. Fetch recipient + campaign + template from DB
    # 2. Decrypt SMTP credentials
    # 3. Personalize template (replace {{name}}, {{company}}, etc.)
    # 4. Build MIME message
    # 5. Send via SMTP
    # 6. Log result (sent/failed + reason)
    # 7. Update campaign counters
    try:
        # ... sending logic ...
        time.sleep(4)  # 4 second delay between emails (deliverability)
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)  # retry after 60 seconds
```

Campaign dispatch:
```python
# When user clicks "Send Campaign":
def dispatch_campaign(campaign_id: int):
    recipients = get_all_recipients(campaign_id)
    for i, recipient in enumerate(recipients):
        send_single_email.apply_async(
            args=[recipient.id],
            countdown=i * 4  # stagger: 0s, 4s, 8s, 12s...
        )
    update_campaign_status(campaign_id, "running")
```

Daily cap enforcement (in the worker, not the API):
```python
def check_daily_cap(user_id: int, plan: str) -> bool:
    caps = {"starter": 200, "growth": 1000, "agency": 5000}
    sent_today = get_sent_count_today(user_id)  # from email_logs
    return sent_today < caps.get(plan, 200)
```

---

### Phase 3 — Frontend (Days 8–10)

#### Pages to Build (Priority Order)

1. `/login` and `/register` — Simple, clean, fast
2. `/dashboard` — Campaign list + quick stats (sent today, active campaigns)
3. `/campaigns/new` — The most important page
4. `/campaigns/[id]` — Campaign detail + live log view
5. `/templates` — Template list + editor
6. `/settings/smtp` — Connect Gmail, show status
7. `/logs` — Full email log table with filters

#### The Campaign Creation Flow (Most Important UX)

```
Step 1 (SMTP Check):
  → If no SMTP connected: redirect to settings/smtp first
  → Show clear instructions: "Use Gmail App Password, not your real password"
  → Link to Google's "How to create App Password" guide

Step 2 (Upload Contacts):
  → Drag-and-drop zone for Excel/CSV
  → OR paste Google Sheets URL (Phase 2 feature)
  → Show validation results before continuing
  → Allow user to download "rejected contacts" as CSV

Step 3 (Choose Template):
  → Select existing OR create inline
  → Live preview: shows first contact's data filled in
  → Subject line + HTML body

Step 4 (Review & Send):
  → Summary: "Sending to 287 contacts from yourname@gmail.com"
  → Estimated time: "~19 minutes (4s per email)"
  → Big "Send Campaign" button
  → OR "Schedule for later" (Phase 2)
```

---

## PART 6 — DELIVERABILITY STRATEGY

### What Your Users Must Do (Educate Them)

This is where most campaigns fail. Build this as an onboarding checklist in the UI.

#### For Gmail App Password Setup:
1. Go to Google Account → Security
2. Enable 2-Factor Authentication (required)
3. Go to "App Passwords" → Select "Mail" → "Other device"
4. Name it "MailFlow" → Copy the 16-character password
5. Use this password in MailFlow (not your Gmail password)

#### Domain Authentication (Show as Checklist in Dashboard):

```
□ SPF record set      → "v=spf1 include:_spf.google.com ~all"
□ DKIM enabled        → Enable in Google Workspace admin
□ DMARC record set    → "v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com"
```

Show a "Check My Domain" button that runs DNS lookups and shows green/red status.

#### Sending Safety Defaults (Non-Negotiable):

| Setting | Value | Reason |
|---|---|---|
| Delay between emails | 4 seconds | Looks human, not bot |
| Daily cap (Starter) | 200 emails | Gmail soft limit |
| Daily cap (Growth) | 1,000 emails | Safe for warmed domain |
| Max bounce rate trigger | 5% → pause campaign | Protect SMTP account |
| Duplicate email guard | Block same email twice/24hrs | Prevent spam complaints |

---

## PART 7 — LAUNCH PLAN

### Week 1: Close Your 5 Clients (Before Full MVP)

Do NOT wait for the product to be perfect. Do this:

1. **Day 1**: Send each of the 5 interested clients a WhatsApp message:

> "Hey [Name], we're building a tool specifically for businesses like yours — simple email campaigns using your own Gmail account. ₹1,499/month, no hidden costs, no per-email charges. Want to be our first 5 users and help us shape it? We onboard you personally."

2. **Day 2**: Get verbal commitments. Collect payment via Razorpay link (you can set this up in 1 hour). Take first month upfront.

3. **Days 3–12**: Build the MVP (see Phase 1–3 above, realistic 10 days).

4. **Day 13**: Do a video call onboarding with each client. Share screen, help them set up Gmail App Password, upload their first Excel sheet, send first campaign together.

5. **Day 14**: Follow up: "How did the first campaign go? Any emails bounce?"

### Revenue Timeline

| Month | Clients | Revenue | Infra Cost | Margin |
|---|---|---|---|---|
| Month 1 | 5 @ ₹1,499 | ₹7,495 | ₹2,500 | ₹4,995 (67%) |
| Month 2 | 8 clients | ₹11,992 | ₹2,800 | ₹9,192 (77%) |
| Month 3 | 15 clients | ₹22,485 | ₹3,500 | ₹18,985 (84%) |
| Month 6 | 35 clients | ₹52,465 | ₹6,000 | ₹46,465 (89%) |

Month 6 without a single Growth/Agency client. Add even 3 Growth plan clients (₹3,499) and Month 6 revenue crosses ₹62,000/month.

---

## PART 8 — WHAT NOT TO BUILD (AND WHEN TO BUILD IT)

### MVP — Ship This First

- Gmail/custom SMTP connection (locked per account)
- Excel/CSV upload with validation
- Template editor with `{{name}}`, `{{company}}`, `{{email}}` variables
- Campaign send (queued, 4s delay, daily cap)
- Basic log (sent / failed / reason)
- PDF attachment support
- JWT auth with refresh tokens

### Phase 2 (Month 2–3, after 10+ paying clients)

- Google Sheets direct URL import
- Campaign scheduling (send at 10am tomorrow)
- Domain health checker (SPF/DKIM/DMARC)
- Basic open tracking (pixel) — if clients ask
- Multi-SMTP on Growth plan (up to 3 accounts)

### Phase 3 (Month 4–6, after product-market fit confirmed)

- Custom domain email support (your own domain SMTP)
- Campaign analytics (open rate, click rate)
- n8n integration as "automation triggers" for power users
- API access for Growth/Agency plans
- White-labeling for Agency plan

### Never Build (Unless Clients Specifically Ask and Pay More)

- AI email generation
- Inbox warmup system
- Lead finding / contact database
- LinkedIn outreach
- SMS marketing
- CRM functionality

---

## PART 9 — SECURITY CHECKLIST

Before the first client goes live, verify every item:

### SMTP Credentials

- [ ] Fernet key is in Railway env vars, NOT in codebase or DB
- [ ] Encrypted credentials stored in `smtp_credentials.encrypted_password`
- [ ] `/smtp/status` endpoint returns only masked email (e.g., `yourn***@gmail.com`)
- [ ] Decryption only happens inside the Celery worker, never in API responses
- [ ] No SMTP password in any log file

### Authentication

- [ ] Passwords hashed with bcrypt (cost factor 12)
- [ ] JWT access token: 15 minute expiry
- [ ] JWT refresh token: 7 day expiry, httpOnly cookie
- [ ] Rate limiting on `/auth/login`: max 5 attempts per IP per minute
- [ ] Email verification on signup (prevents fake accounts)

### File Uploads

- [ ] Accept only: .csv, .xlsx, .xls, .pdf, .docx, .png, .jpg
- [ ] Max upload size: 10MB (enforced at FastAPI middleware level)
- [ ] Virus scan not needed at MVP, but validate file headers (magic bytes)
- [ ] Files stored on Cloudflare R2, not local disk
- [ ] Presigned URLs with expiry for file access (not public URLs)

### API

- [ ] All endpoints require valid JWT (except /auth/*)
- [ ] Users can only access their own campaigns/templates/contacts
- [ ] No user can access another user's SMTP credentials (row-level ownership checks)
- [ ] Input validation via Pydantic v2 on all request bodies

---

## PART 10 — OPERATIONS & GROWTH

### Customer Support System (Simple)

- **WhatsApp Business number**: this is your primary support channel for Indian SMBs
- **Response time promise**: 24 hours (communicate this at onboarding)
- **Razorpay** for payments: supports UPI, cards, net banking — essential for India
- **No Stripe**: Indian clients prefer UPI/bank transfer

### How to Get to 50 Clients (Months 3–6)

Your 5 launch clients ARE your sales team. Here's how:

1. After 3 weeks, ask each client: "Is it working? How many replies are you getting?"
2. If positive: "Would you refer 2–3 exporters/recruiters in your network? We'll give them 2 weeks free."
3. Post in WhatsApp groups: FIEO (Federation of Indian Export Organisations) groups, IndiaMART seller groups, LinkedIn for recruiters
4. Target communities: Textile exporters (Surat, Tirupur), Pharma exporters (Ahmedabad), IT recruiters (Bangalore, Pune)
5. Write ONE LinkedIn post: "We built a simple email campaign tool for Indian exporters. ₹1,499/month, use your own Gmail, upload Excel, done." — This will get traction.

### The Long-Term Moat

The tools that will kill you are not Mailchimp or Zoho. They are:
- Instantly.ai adding INR pricing and Hindi UI
- Some other Indian dev building the same thing

Your moat must be:
1. **Speed of onboarding**: Can a non-technical exporter set up and send their first campaign in under 30 minutes? If yes, you win.
2. **Support in Indian time zones**: Answering on WhatsApp at 6pm IST beats any global tool's email support.
3. **Understanding your customer's actual business**: Exporters send to foreign buyers. Help them write better subject lines, understand time zones, know that "Dear Sir/Ma'am" is not personalization.

---

## SUMMARY — YOUR NEXT 30 ACTIONS

### This Week (Revenue Before Code)

1. [ ] Change pricing to ₹1,499 (non-negotiable)
2. [ ] Create Razorpay account and a payment link
3. [ ] WhatsApp your 5 interested clients, get verbal yes + payment
4. [ ] Buy domain (mailflow.in or similar)
5. [ ] Create GitHub repo, Railway project, Vercel project

### This Month (Build MVP)

6. [ ] Set up PostgreSQL + Redis on Railway
7. [ ] Set up Cloudflare R2 bucket
8. [ ] Build auth system (register/login/JWT)
9. [ ] Build SMTP connection + test endpoint with Fernet encryption
10. [ ] Build CSV/Excel upload with email validation
11. [ ] Build template editor with variable preview
12. [ ] Set up Redis + Celery worker
13. [ ] Build campaign dispatch (queued, 4s delay, daily cap)
14. [ ] Build email log endpoint
15. [ ] Build Next.js frontend pages (login, dashboard, new campaign, settings)
16. [ ] Deploy to Railway + Vercel
17. [ ] Do personal video call onboarding with all 5 clients
18. [ ] Fix bugs reported by first clients

### Next Month (Grow)

19. [ ] Add Google Sheets import
20. [ ] Add campaign scheduling
21. [ ] Add domain health checker (SPF/DKIM/DMARC checker)
22. [ ] Ask each client for 2 referrals
23. [ ] Get to 15 paying clients
24. [ ] Post in 3 export/recruiter WhatsApp groups
25. [ ] Add Growth plan (₹3,499) and onboard first Growth client

---

*Last updated: May 2026*
*This document is a living plan. Update it monthly as clients give feedback.*
