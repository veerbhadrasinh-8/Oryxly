01\_PRD.md
==========

MailFlow
========

Product Requirements Document (PRD)
-----------------------------------

**Version:** 1.0**Product:** MailFlow**Company:** Oryxus**Document Owner:** Product Team**Status:** Approved for MVP Development**Target Release:** MVP v1

1\. Executive Summary
=====================

MailFlow is a SaaS email campaign platform designed specifically for Indian SMBs, exporters, recruiters, agencies, and service-based businesses.

The platform enables users to connect their own SMTP account, upload contact lists, create personalized email campaigns, and send emails through their own infrastructure while maintaining full visibility into campaign performance and email delivery logs.

MailFlow focuses on simplicity, affordability, and ease of use while avoiding unnecessary complexity found in enterprise marketing platforms.

The platform is not intended to compete directly with large marketing automation suites. Instead, it provides a focused and streamlined email outreach solution for businesses that need reliable email campaign management without complex setup processes.

2\. Product Vision
==================

Build the simplest and most reliable email campaign platform for Indian businesses.

Users should be able to:

*   Register
    
*   Connect their email account
    
*   Upload contacts
    
*   Create templates
    
*   Launch campaigns
    
*   Monitor results
    

Within minutes.

3\. Problem Statement
=====================

Most existing solutions fall into two categories:

### Category 1: Global Platforms

Examples:

*   Instantly
    
*   Smartlead
    
*   Mailchimp
    
*   Brevo
    

Problems:

*   Expensive for Indian SMBs
    
*   USD pricing
    
*   Complex interfaces
    
*   Feature overload
    
*   Difficult onboarding
    

### Category 2: Enterprise Platforms

Examples:

*   Zoho Campaigns
    
*   Netcore
    

Problems:

*   Built for larger organizations
    
*   Complicated setup
    
*   Long learning curve
    
*   Unnecessary features
    

### Market Gap

Indian businesses need:

*   Simple campaign creation
    
*   Affordable INR pricing
    
*   Easy onboarding
    
*   Own SMTP usage
    
*   Contact management
    
*   Reliable sending
    

Without enterprise complexity.

4\. Product Goals
=================

Primary Goals
-------------

### Goal 1

Acquire first 5 paying customers.

### Goal 2

Launch production-ready MVP.

### Goal 3

Create recurring SaaS revenue.

### Goal 4

Provide simple email outreach workflows.

### Goal 5

Minimize customer support requirements.

5\. Success Metrics
===================

Business Metrics
----------------

### Monthly Recurring Revenue

Target:

₹7,500+ within first month.

### Paying Customers

Target:

5 customers during MVP phase.

### Customer Retention

Target:

80%+ retention after first month.

Product Metrics
---------------

### Campaign Success Rate

Target:

95%+ successful campaign execution.

### SMTP Connection Success

Target:

90%+ successful verification.

### Campaign Completion

Target:

95%+ completed campaigns.

### User Activation

Target:

User sends first campaign within 24 hours of signup.

6\. Target Audience
===================

Primary Users
-------------

### Exporters

Use Cases:

*   Buyer outreach
    
*   Product announcements
    
*   Business proposals
    

### Recruiters

Use Cases:

*   Candidate outreach
    
*   Job campaigns
    
*   Talent acquisition
    

### Agencies

Use Cases:

*   Client campaigns
    
*   Lead outreach
    
*   Business development
    

### SMB Owners

Use Cases:

*   Prospect communication
    
*   Customer updates
    
*   Business outreach
    

7\. User Personas
=================

Persona 1
---------

### Export Manager

Responsibilities:

*   Finding international buyers
    
*   Outreach campaigns
    
*   Lead generation
    

Pain Points:

*   Manual emailing
    
*   Contact management
    
*   Campaign tracking
    

Goals:

*   Reach more buyers
    
*   Save time
    
*   Track communication
    

Persona 2
---------

### Recruitment Consultant

Responsibilities:

*   Candidate outreach
    
*   Job marketing
    

Pain Points:

*   Sending repetitive emails
    
*   Managing large contact lists
    

Goals:

*   Faster communication
    
*   Better organization
    

Persona 3
---------

### Marketing Agency Owner

Responsibilities:

*   Managing outreach campaigns
    

Pain Points:

*   Multiple tools
    
*   High software costs
    

Goals:

*   Centralized campaign management
    

8\. Product Scope
=================

Included in MVP
---------------

### Authentication

*   Register
    
*   Login
    
*   Logout
    
*   Refresh Token
    
*   Password Hashing
    

### SMTP Management

*   Add SMTP
    
*   Verify SMTP
    
*   Test SMTP
    
*   Delete SMTP
    

### Contact Upload

Supported Formats:

*   CSV
    
*   XLSX
    
*   XLS
    

Validation:

*   Email validation
    
*   Duplicate detection
    

### Templates

*   Create
    
*   Edit
    
*   Delete
    
*   Preview
    

Variables:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {{name}}  {{company}}  {{email}}   `

### Campaigns

*   Create Campaign
    
*   Launch Campaign
    
*   Pause Campaign
    
*   View Campaign
    

### Email Sending

*   Queue processing
    
*   Retry handling
    
*   Delay control
    
*   SMTP sending
    

### Logs

*   Sent
    
*   Failed
    
*   Pending
    

### Attachments

Supported:

*   PDF
    
*   DOCX
    
*   PNG
    
*   JPG
    

9\. Out of Scope (MVP)
======================

The following will NOT be built during MVP:

### AI Features

*   AI Email Generation
    
*   AI Personalization
    

### CRM Features

*   Lead Pipelines
    
*   Opportunity Tracking
    

### Marketing Automation

*   Workflow Builder
    
*   Visual Automation Engine
    

### Lead Generation

*   Contact Databases
    
*   Lead Scraping
    

### Social Channels

*   LinkedIn Automation
    
*   WhatsApp Campaigns
    
*   SMS Marketing
    

10\. User Journey
=================

Journey 1 — New User
--------------------

### Step 1

User registers.

### Step 2

User logs in.

### Step 3

User connects SMTP.

### Step 4

SMTP is verified.

### Step 5

User enters dashboard.

Journey 2 — Create Campaign
---------------------------

### Step 1

Upload contacts.

### Step 2

Validate contacts.

### Step 3

Select template.

### Step 4

Preview campaign.

### Step 5

Launch campaign.

### Step 6

Monitor progress.

11\. Functional Requirements
============================

Authentication Module
---------------------

### Requirements

User can:

*   Register
    
*   Login
    
*   Logout
    
*   Refresh session
    

Validation:

*   Unique email
    
*   Password minimum 8 characters
    

SMTP Module
-----------

### Requirements

User can:

*   Connect SMTP account
    
*   Verify SMTP account
    
*   Remove SMTP account
    

System must:

*   Encrypt passwords
    
*   Never expose credentials
    

Contact Module
--------------

### Requirements

User can:

*   Upload CSV
    
*   Upload Excel
    

System must:

*   Validate emails
    
*   Detect duplicates
    
*   Show invalid contacts
    

Template Module
---------------

### Requirements

User can:

*   Create template
    
*   Edit template
    
*   Delete template
    
*   Preview template
    

System must:

*   Detect variables
    
*   Validate syntax
    

Campaign Module
---------------

### Requirements

User can:

*   Create campaign
    
*   Launch campaign
    
*   Cancel campaign
    

System must:

*   Queue jobs
    
*   Retry failures
    
*   Update status
    

Log Module
----------

### Requirements

User can:

*   View sending logs
    
*   Filter logs
    
*   Search logs
    

12\. Subscription Plans
=======================

Starter
-------

Price:

₹1,499/month

Limits:

*   1 SMTP account
    
*   2,000 contacts
    
*   5 campaigns/month
    

Growth
------

Price:

₹3,499/month

Limits:

*   3 SMTP accounts
    
*   Unlimited campaigns
    
*   Attachments
    

Agency
------

Price:

₹7,999/month

Limits:

*   10 SMTP accounts
    
*   Team access
    
*   Priority support
    

13\. Business Rules
===================

SMTP Rules
----------

Starter:

1 SMTP maximum

Growth:

3 SMTP maximum

Agency:

10 SMTP maximum

Daily Sending Limits
--------------------

Starter:

200 emails/day

Growth:

1,000 emails/day

Agency:

5,000 emails/day

File Upload Limits
------------------

Maximum:

10 MB

Campaign Delay
--------------

Minimum:

4 seconds between emails

14\. Reporting Requirements
===========================

Dashboard must display:

### Campaign Metrics

*   Total Campaigns
    
*   Running Campaigns
    
*   Completed Campaigns
    

### Email Metrics

*   Sent
    
*   Failed
    
*   Pending
    

### SMTP Metrics

*   Active SMTP Accounts
    
*   Verified Accounts
    

15\. Future Roadmap
===================

Phase 2
-------

*   Campaign Scheduling
    
*   Google Sheets Import
    
*   Domain Health Checker
    
*   Open Tracking
    
*   Click Tracking
    

Phase 3
-------

*   Team Members
    
*   White Labeling
    
*   Public API
    
*   Custom Branding
    

Phase 4
-------

*   Automation Engine
    
*   Advanced Analytics
    
*   Webhooks
    
*   Integrations
    

16\. Acceptance Criteria
========================

The MVP is considered complete when:

*   Users can register and login
    
*   SMTP can be connected successfully
    
*   Contacts can be uploaded
    
*   Templates can be created
    
*   Campaigns can be launched
    
*   Emails can be delivered
    
*   Logs can be viewed
    
*   Dashboard metrics are available
    
*   System supports at least 5 paying customers
    
*   Production deployment is stable
    

17\. MVP Release Definition
===========================

The MVP release must provide:

*   Authentication
    
*   SMTP Management
    
*   Contact Upload
    
*   Template Management
    
*   Campaign Management
    
*   Email Sending
    
*   Logging
    
*   Dashboard
    
*   Billing Preparation
    

Any feature outside this list is considered post-MVP.

End of Document
===============

MailFlow Product Requirements Document (PRD)
============================================