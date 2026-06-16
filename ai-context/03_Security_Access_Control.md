03\_Security\_Access\_Control.md
================================

MailFlow
========

Security & Access Control Document
----------------------------------

**Version:** 1.0**Owner:** Oryxus Engineering Team**Classification:** Internal**Status:** Approved for MVP Development

1\. Purpose
===========

This document defines the complete security architecture, access control framework, authentication model, authorization rules, encryption standards, infrastructure security policies, and operational security procedures for MailFlow.

The objective is to ensure:

*   User isolation
    
*   Data protection
    
*   Secure email delivery
    
*   Infrastructure protection
    
*   Regulatory readiness
    
*   Secure SaaS operations
    

2\. Security Objectives
=======================

Primary Objectives
------------------

### Protect User Data

Ensure all customer information remains private and isolated.

### Protect SMTP Credentials

SMTP credentials are the most sensitive assets within the system.

### Prevent Unauthorized Access

Only authenticated and authorized users may access resources.

### Prevent Data Leakage

Users must never access data belonging to another user.

### Ensure Platform Integrity

Protect APIs, databases, queues, and infrastructure.

3\. Security Architecture Overview
==================================

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   User Browser        │  HTTPS/TLS        │        ▼  Next.js Frontend        │  HTTPS/TLS        ▼  FastAPI Backend        │   ┌────┴────┐   ▼         ▼  Postgres   Redis        │        ▼  Celery Workers        │        ▼  SMTP Providers   `

Security layers exist at:

*   Network Layer
    
*   Application Layer
    
*   Database Layer
    
*   Queue Layer
    
*   Infrastructure Layer
    

4\. Authentication Architecture
===============================

Authentication Method
---------------------

MailFlow uses:

*   JWT Access Tokens
    
*   Refresh Tokens
    
*   Password Authentication
    

Login Flow
----------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Email + Password         │  Verify Credentials         │  Generate Access Token         │  Generate Refresh Token         │  Return Session   `

Access Token
------------

Purpose:

API Authentication

Expiration:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   15 Minutes   `

Contains:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {    "sub": "user_id",    "email": "user@email.com",    "type": "access"  }   `

Refresh Token
-------------

Purpose:

Session Renewal

Expiration:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   7 Days   `

Storage:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   HttpOnly Cookie   `

5\. Password Security
=====================

Storage Method
--------------

Passwords are NEVER stored in plaintext.

Hashing Algorithm
-----------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   bcrypt   `

Cost Factor:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   12   `

Example
-------

Stored:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   $2b$12$...   `

Never:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   password123   `

6\. SMTP Credential Security
============================

Risk Level
----------

Critical

SMTP credentials are the most sensitive information stored by MailFlow.

Storage Method
--------------

Passwords are encrypted before database storage.

Encryption Algorithm
--------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Fernet   `

Encryption Flow
---------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   User Password        │  Encrypt        │  Store Ciphertext        │  Database   `

Decryption Flow
---------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Worker      │  Decrypt      │  SMTP Login      │  Clear Memory   `

Rules
-----

### Allowed

Encrypted Storage

### Not Allowed

Plaintext Storage

### Allowed

Decryption inside Worker

### Not Allowed

Returning password via API

7\. Authorization Model
=======================

Principle
---------

Least Privilege

Users may access only their own resources.

8\. Tenant Isolation
====================

Every resource contains:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   user_id   `

Required Query Pattern
----------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   SELECT *  FROM campaigns  WHERE user_id = current_user   `

Forbidden Query
---------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   SELECT *  FROM campaigns   `

Without ownership filtering.

9\. Resource Ownership Matrix
=============================

ResourceOwnerUserUserSMTPUserCampaignUserTemplateUserAttachmentUserLogsUser

10\. Authentication Rules
=========================

Public Routes
-------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   /auth/register  /auth/login  /auth/refresh   `

Protected Routes
----------------

Everything else.

Required Header
---------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Authorization: Bearer TOKEN   `

11\. Role Model
===============

MVP Roles
---------

### User

Can:

*   Manage own data
    
*   Launch campaigns
    

Cannot:

*   Access admin functionality
    

### Admin

Can:

*   View users
    
*   Reset accounts
    
*   Monitor platform
    

Cannot:

*   Access SMTP passwords
    

12\. Session Security
=====================

Token Expiration
----------------

Access Token:

15 Minutes

Refresh Token:

7 Days

Session Termination
-------------------

Logout:

*   Deletes refresh token
    
*   Invalidates session
    

13\. API Security
=================

Request Validation
------------------

All requests validated using:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Pydantic v2   `

Input Validation
----------------

Validate:

*   Email
    
*   Password
    
*   File Type
    
*   File Size
    
*   IDs
    

Output Filtering
----------------

Never return:

*   SMTP Passwords
    
*   Internal Secrets
    
*   Encryption Keys
    

14\. Rate Limiting
==================

Login Endpoint
--------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   5 Requests / Minute   `

Registration
------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   5 Requests / Minute   `

Upload Endpoints
----------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   10 Requests / Minute   `

Campaign Launch
---------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   5 Requests / Minute   `

15\. File Upload Security
=========================

Allowed Formats
---------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   CSV  XLS  XLSX  PDF  DOCX  PNG  JPG   `

Maximum Size
------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   10 MB   `

Validation Rules
----------------

Check:

*   Extension
    
*   MIME Type
    
*   File Signature
    

Blocked
-------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   EXE  BAT  JS  SH  PHP   `

16\. Storage Security
=====================

Attachment Storage
------------------

Cloudflare R2

Public Access
-------------

Disabled

Access Method
-------------

Signed URLs

URL Expiration
--------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   15 Minutes   `

17\. Transport Security
=======================

Protocol
--------

HTTPS Only

TLS Version
-----------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   TLS 1.2+   `

HTTP
----

Redirected to HTTPS

18\. Database Security
======================

Connection Security
-------------------

SSL Required

Database Access
---------------

Allowed:

Backend

Workers

Not Allowed:

Frontend

Users

19\. Redis Security
===================

Access
------

Internal Only

Public Exposure
---------------

Forbidden

Purpose
-------

*   Queue
    
*   Cache
    
*   Rate Limiting
    

20\. Secret Management
======================

Environment Variables
---------------------

Store:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   SECRET_KEY  FERNET_KEY  DATABASE_URL  REDIS_URL  R2_KEYS   `

Forbidden
---------

Secrets inside:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Git Repository  Frontend  Logs   `

21\. Audit Logging
==================

Track:

### Authentication

*   Login
    
*   Logout
    
*   Failed Login
    

### SMTP Events

*   Add SMTP
    
*   Remove SMTP
    
*   Verify SMTP
    

### Campaign Events

*   Create Campaign
    
*   Launch Campaign
    
*   Cancel Campaign
    

22\. Security Logging
=====================

Store:

*   Timestamp
    
*   User ID
    
*   Action
    
*   Result
    

23\. Monitoring
===============

Monitor:

*   Failed Logins
    
*   SMTP Failures
    
*   API Errors
    
*   Queue Failures
    

24\. Abuse Prevention
=====================

Email Sending Limits
--------------------

Starter:

200/day

Growth:

1000/day

Agency:

5000/day

Duplicate Protection
--------------------

Block duplicate sending.

Bounce Protection
-----------------

Pause campaign if bounce rate exceeds threshold.

25\. Incident Response
======================

Credential Leak
---------------

Actions:

1.  Disable account
    
2.  Force password reset
    
3.  Notify user
    

SMTP Compromise
---------------

Actions:

1.  Disable SMTP
    
2.  Alert user
    
3.  Require reconnection
    

API Abuse
---------

Actions:

1.  Rate limit
    
2.  Temporary block
    
3.  Admin review
    

26\. Backup Security
====================

Database Backups
----------------

Daily

Retention:

30 Days

Attachment Backups
------------------

Cloudflare R2

27\. Security Testing
=====================

Before Production:

### Authentication Testing

Pass

### Authorization Testing

Pass

### File Upload Testing

Pass

### SMTP Encryption Testing

Pass

### Rate Limiting Testing

Pass

28\. Security Checklist
=======================

Authentication
--------------

*   JWT Enabled
    
*   Refresh Tokens Enabled
    
*   Password Hashing Enabled
    

SMTP
----

*   Encrypted Storage
    
*   Worker-Only Decryption
    

API
---

*   Validation Enabled
    
*   Rate Limiting Enabled
    

Infrastructure
--------------

*   HTTPS Enabled
    
*   SSL Enabled
    

Storage
-------

*   Signed URLs Enabled
    
*   Public Access Disabled
    

29\. Compliance Readiness
=========================

System designed to support:

*   GDPR Principles
    
*   Data Minimization
    
*   User Data Ownership
    
*   Secure Storage Practices
    

30\. Security Definition of Done
================================

A feature is production-ready only if:

*   Authentication validated
    
*   Authorization validated
    
*   Input validated
    
*   Secrets protected
    
*   Logs generated
    
*   Ownership enforced
    

End of Document
===============

MailFlow Security & Access Control Document
===========================================