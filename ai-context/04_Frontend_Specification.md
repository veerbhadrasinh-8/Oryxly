04\_Frontend\_Specification.md
==============================

MailFlow
========

Frontend Specification Document
-------------------------------

**Version:** 1.0**Owner:** Product & Design Team**Status:** Approved for Development

1\. Purpose
===========

This document defines the complete frontend architecture, UX patterns, UI behavior, design system, page specifications, component structure, user flows, responsive behavior, and implementation requirements for MailFlow.

The objective is to ensure:

*   Consistent UI
    
*   Fast user onboarding
    
*   Minimal learning curve
    
*   High conversion rates
    
*   Professional SaaS experience
    

2\. Design Philosophy
=====================

Core Principles
---------------

### Simplicity First

Users should never need training to use the platform.

### Business Focused

The product should feel like a business tool, not a marketing tool.

### Fast Actions

Users should be able to:

*   Connect SMTP
    
*   Upload Contacts
    
*   Launch Campaign
    

Within minutes.

### Reduce Cognitive Load

Avoid:

*   Complex workflows
    
*   Excessive menus
    
*   Multi-level navigation
    

3\. Visual Design Direction
===========================

Design Style
------------

Modern SaaS

Characteristics:

*   Clean
    
*   Minimal
    
*   Professional
    
*   High readability
    

Inspirations
------------

*   Linear
    
*   Stripe Dashboard
    
*   Notion
    
*   Vercel Dashboard
    
*   Resend
    

4\. Color System
================

Primary Color
-------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   #2563EB   `

Purpose:

*   Buttons
    
*   Links
    
*   Active States
    

Success
-------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   #16A34A   `

Purpose:

*   Sent Emails
    
*   Success States
    

Warning
-------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   #F59E0B   `

Purpose:

*   Pending Status
    

Error
-----

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   #DC2626   `

Purpose:

*   Failed Emails
    
*   Validation Errors
    

Background
----------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   #FFFFFF   `

Surface
-------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   #F8FAFC   `

Text Primary
------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   #0F172A   `

Text Secondary
--------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   #64748B   `

5\. Typography
==============

Font Family
-----------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Inter   `

Fallback:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   sans-serif   `

Heading Sizes
-------------

### H1

48px

### H2

36px

### H3

24px

### H4

20px

Body
----

16px

Small
-----

14px

6\. Layout System
=================

Application Layout
------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   ┌──────────────────────┐  │ Top Navigation Bar   │  ├──────┬───────────────┤  │Side  │ Main Content  │  │Bar   │               │  └──────┴───────────────┘   `

Sidebar Width
-------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   280px   `

Content Width
-------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   max-width: 1440px   `

7\. Route Structure
===================

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   /  ├── login  ├── register  ├── dashboard  ├── campaigns  │   ├── new  │   └── [id]  ├── templates  │   ├── new  │   └── [id]  ├── settings  │   └── smtp  └── logs   `

8\. Authentication Pages
========================

Login Page
----------

### Purpose

Authenticate users.

### Fields

*   Email
    
*   Password
    

### Actions

*   Login
    
*   Forgot Password
    

### Validation

Email:

Required

Password:

Required

### Success

Redirect:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   /dashboard   `

Register Page
-------------

### Fields

*   Full Name
    
*   Email
    
*   Password
    

### Validation

Password:

Minimum 8 characters

9\. Dashboard Page
==================

Purpose
-------

Provide overview of account activity.

Components
----------

### KPI Cards

Show:

*   Total Campaigns
    
*   Sent Today
    
*   Failed Today
    
*   Active Campaigns
    

### Recent Campaigns Table

Columns:

*   Name
    
*   Status
    
*   Sent
    
*   Failed
    
*   Created
    

### Quick Actions

Buttons:

*   New Campaign
    
*   Create Template
    
*   Connect SMTP
    

10\. Sidebar Navigation
=======================

Items:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Dashboard  Campaigns  Templates  SMTP Settings  Logs   `

Active State
------------

Highlight current page.

11\. Campaign List Page
=======================

Purpose
-------

Display all campaigns.

Filters
-------

*   Status
    
*   Date Range
    

Search
------

Search by:

*   Campaign Name
    

Table Columns
-------------

*   Name
    
*   Status
    
*   Total Recipients
    
*   Sent
    
*   Failed
    
*   Created At
    

12\. Campaign Creation Wizard
=============================

Purpose
-------

Create campaigns using guided workflow.

Step Structure
--------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Step 1 → Contacts  Step 2 → Template  Step 3 → Review  Step 4 → Launch   `

13\. Step 1 — Upload Contacts
=============================

Upload Methods
--------------

### CSV

Supported

### XLSX

Supported

### XLS

Supported

UI Components
-------------

*   Drag Drop Zone
    
*   Upload Button
    

Results
-------

Display:

*   Total Contacts
    
*   Valid Contacts
    
*   Invalid Contacts
    
*   Duplicate Contacts
    

14\. Contact Validation Screen
==============================

Display:

### Success

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   287 Valid Contacts   `

### Error

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   13 Invalid Contacts   `

### Preview Table

Show first 10 contacts.

15\. Step 2 — Select Template
=============================

Options
-------

### Existing Template

Select from list.

### Create New

Inline creation.

Template Preview
----------------

Live rendering.

16\. Template Editor
====================

Fields
------

### Name

Required

### Subject

Required

### HTML Body

Required

Variables
---------

Supported:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {{name}}  {{company}}  {{email}}   `

17\. Template Preview Panel
===========================

Show:

### Subject Preview

Rendered version

### Body Preview

Rendered version

18\. Step 3 — Campaign Review
=============================

Display:

*   SMTP Account
    
*   Total Contacts
    
*   Template Name
    
*   Attachments
    

Estimated Time
--------------

Example:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   287 Contacts  ≈ 19 Minutes   `

19\. Step 4 — Launch
====================

Final Confirmation
------------------

Button:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Launch Campaign   `

Success State
-------------

Show:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Campaign Queued Successfully   `

20\. Campaign Detail Page
=========================

Purpose
-------

Monitor campaign progress.

Components
----------

### Campaign Summary

*   Name
    
*   Status
    
*   Sent
    
*   Failed
    

### Progress Bar

Real-time progress.

### Live Activity Feed

Updates every few seconds.

21\. SMTP Settings Page
=======================

Purpose
-------

Connect SMTP account.

Fields
------

### Email Address

Required

### SMTP Host

Required

### SMTP Port

Required

### Password

Required

Actions
-------

*   Connect
    
*   Test Connection
    
*   Delete SMTP
    

22\. SMTP Status Card
=====================

Show:

*   Connected
    
*   Verified
    
*   Last Tested
    

23\. Templates Page
===================

Purpose
-------

Manage templates.

Grid Layout
-----------

Cards display:

*   Name
    
*   Variables
    
*   Last Updated
    

Actions
-------

*   Edit
    
*   Duplicate
    
*   Delete
    

24\. Logs Page
==============

Purpose
-------

View email activity.

Filters
-------

*   Status
    
*   Campaign
    
*   Date Range
    

Table Columns
-------------

*   Recipient
    
*   Campaign
    
*   Status
    
*   Attempt
    
*   Timestamp
    

25\. Status System
==================

Draft
-----

Gray

Queued
------

Blue

Running
-------

Yellow

Completed
---------

Green

Failed
------

Red

26\. Empty States
=================

No Campaigns
------------

Display:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   No Campaigns Yet  Create Your First Campaign   `

No Templates
------------

Display:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   No Templates Found  Create Your First Template   `

No SMTP
-------

Display:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Connect SMTP Before Sending Emails   `

27\. Loading States
===================

Dashboard
---------

Use skeleton cards.

Tables
------

Use skeleton rows.

Campaign Progress
-----------------

Use animated progress bars.

28\. Notifications
==================

Success
-------

Green Toast

Error
-----

Red Toast

Warning
-------

Yellow Toast

29\. Modal System
=================

Confirmation Modals
-------------------

Used for:

*   Delete Campaign
    
*   Delete Template
    
*   Delete SMTP
    

30\. Responsive Design
======================

Desktop
-------

1440px+

Full Sidebar

Tablet
------

768px–1439px

Collapsible Sidebar

Mobile
------

Below 768px

Drawer Navigation

31\. Accessibility
==================

Requirements
------------

*   Keyboard Navigation
    
*   Focus States
    
*   Screen Reader Labels
    
*   Contrast Compliance
    

32\. Component Library
======================

Base Components
---------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Button  Input  Textarea  Select  Modal  Toast  Card  Badge  Table  Tabs  Dropdown  Tooltip   `

33\. State Management
=====================

Global State
------------

Use:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Zustand   `

For:

*   Auth State
    
*   User State
    

Server State
------------

Use:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   TanStack Query   `

For:

*   API Data
    
*   Campaign Polling
    

34\. API Layer
==============

HTTP Client
-----------

Use:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Axios   `

Base URL
--------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   NEXT_PUBLIC_API_URL   `

35\. Frontend Folder Structure
==============================

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   src  app  components  hooks  stores  lib  types   `

36\. UX Goals
=============

Users should:

*   Connect SMTP within 2 minutes
    
*   Upload contacts within 1 minute
    
*   Launch campaign within 5 minutes
    

Without external help.

37\. Frontend Definition of Done
================================

Feature is complete when:

*   UI implemented
    
*   Validation implemented
    
*   API connected
    
*   Loading states added
    
*   Empty states added
    
*   Error states added
    
*   Mobile responsive
    
*   Accessibility reviewed
    

38\. MVP Frontend Scope
=======================

Included:

*   Authentication
    
*   Dashboard
    
*   Campaigns
    
*   Templates
    
*   SMTP
    
*   Logs
    

Excluded:

*   Analytics
    
*   Scheduling
    
*   Team Management
    
*   White Label
    

End of Document
===============

MailFlow Frontend Specification Document
========================================