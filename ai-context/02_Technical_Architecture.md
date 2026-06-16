02\_Technical\_Architecture.md
==============================

MailFlow
========

Technical Architecture Document
-------------------------------

**Version:** 1.0**Architecture Owner:** Oryxus Engineering Team**Status:** Approved for MVP Development

1\. Architecture Overview
=========================

Purpose
-------

This document defines the complete technical architecture of MailFlow, including:

*   Infrastructure
    
*   Frontend Architecture
    
*   Backend Architecture
    
*   Database Architecture
    
*   Queue Processing
    
*   Deployment Strategy
    
*   Scaling Strategy
    
*   Monitoring
    
*   Reliability Standards
    

2\. System Overview
===================

MailFlow is a multi-tenant SaaS application where each user can:

*   Connect SMTP accounts
    
*   Upload contacts
    
*   Create templates
    
*   Launch campaigns
    
*   Track email delivery
    

All email sending operations are asynchronous.

3\. High Level Architecture
===========================

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   ┌────────────────────────────┐  │        User Browser         │  └─────────────┬──────────────┘                │                ▼  ┌────────────────────────────┐  │       Next.js Frontend      │  │         (Vercel)            │  └─────────────┬──────────────┘                │ HTTPS                ▼  ┌────────────────────────────┐  │       FastAPI Backend       │  │         (Railway)           │  └──────┬───────────┬─────────┘         │           │         ▼           ▼  ┌─────────────┐ ┌──────────────┐  │ PostgreSQL  │ │    Redis     │  └─────────────┘ └──────┬───────┘                         │                         ▼                ┌────────────────┐                │ Celery Workers │                └───────┬────────┘                        │                        ▼               ┌─────────────────┐               │ SMTP Providers  │               └─────────────────┘   `

4\. Core Architectural Principles
=================================

Principle 1
-----------

Stateless API Layer

All state stored in:

*   PostgreSQL
    
*   Redis
    

Principle 2
-----------

Asynchronous Email Sending

API never sends emails directly.

All emails must pass through:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Queue  → Worker  → SMTP   `

Principle 3
-----------

Multi-Tenant Design

Every resource belongs to a user.

Example:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   WHERE user_id = ?   `

Principle 4
-----------

Horizontal Scalability

Workers must scale independently.

5\. Technology Stack
====================

Frontend
--------

### Framework

Next.js 15

### Language

TypeScript

### Styling

TailwindCSS

### Components

ShadCN UI

### State Management

Zustand

### Data Fetching

TanStack Query

Backend
-------

### Framework

FastAPI

### Language

Python 3.11+

### Validation

Pydantic v2

### ORM

SQLAlchemy 2

### Migrations

Alembic

Database
--------

### Primary Database

PostgreSQL

Purpose:

*   Users
    
*   Templates
    
*   Campaigns
    
*   Logs
    

Queue System
------------

### Redis

Purpose:

*   Queue Broker
    
*   Caching
    
*   Rate Limiting
    

### Celery

Purpose:

*   Email Sending
    
*   Retry Handling
    
*   Background Jobs
    

Object Storage
--------------

### Cloudflare R2

Purpose:

*   Attachments
    
*   Campaign Assets
    

Hosting
-------

### Frontend

Vercel

### Backend

Railway

### Database

Railway PostgreSQL

### Redis

Railway Redis

6\. Repository Structure
========================

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   mailflow/  frontend/  backend/  docker-compose.yml  README.md  .env.example   `

7\. Frontend Architecture
=========================

Structure
---------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   frontend/src  app/  components/  hooks/  stores/  types/  lib/   `

Routing
-------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   /  ├── login  ├── register  ├── dashboard  ├── campaigns  ├── templates  ├── settings  └── logs   `

Component Architecture
----------------------

### UI Components

Reusable components:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Button  Input  Card  Modal  Badge  Table   `

### Feature Components

Campaign Components

Template Components

SMTP Components

Authentication Components

8\. Backend Architecture
========================

Layered Architecture
--------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   API Layer  ↓  Service Layer  ↓  Repository Layer  ↓  Database Layer   `

API Layer
---------

Responsibilities:

*   Request Handling
    
*   Validation
    
*   Authentication
    

Service Layer
-------------

Responsibilities:

*   Business Logic
    
*   Rules Enforcement
    

Repository Layer
----------------

Responsibilities:

*   Database Queries
    

Database Layer
--------------

Responsibilities:

*   Persistence
    

9\. API Architecture
====================

Versioning
----------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   /api/v1   `

Authentication APIs
-------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   POST /auth/register  POST /auth/login  POST /auth/logout  POST /auth/refresh  GET  /auth/me   `

SMTP APIs
---------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   POST   /smtp/connect  GET    /smtp/list  POST   /smtp/test  DELETE /smtp/{id}   `

Template APIs
-------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   POST   /templates  GET    /templates  GET    /templates/{id}  PUT    /templates/{id}  DELETE /templates/{id}   `

Campaign APIs
-------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   POST   /campaigns  GET    /campaigns  GET    /campaigns/{id}  POST   /campaigns/{id}/launch  DELETE /campaigns/{id}   `

Log APIs
--------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   GET /logs  GET /logs/{campaign_id}   `

10\. Database Architecture
==========================

Core Tables
-----------

### users

Stores:

*   Identity
    
*   Plans
    
*   Authentication
    

### smtp\_credentials

Stores:

*   SMTP Accounts
    
*   Encrypted Passwords
    

### templates

Stores:

*   Email Templates
    
*   Variables
    

### campaigns

Stores:

*   Campaign Metadata
    

### campaign\_recipients

Stores:

*   Recipients
    
*   Status
    

### email\_logs

Stores:

*   Delivery Records
    

### attachments

Stores:

*   File Metadata
    

11\. Database Relationships
===========================

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   User  │  ├── SMTP Credentials  ├── Templates  ├── Campaigns  │  Campaign  │  ├── Recipients  ├── Logs  └── Attachments   `

12\. Queue Architecture
=======================

Purpose
-------

Prevent blocking API requests.

Workflow
--------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Campaign Launch  ↓  Queue Campaign  ↓  Celery Worker  ↓  Send Email  ↓  Log Result  ↓  Update Campaign   `

13\. Celery Worker Architecture
===============================

Worker Types
------------

### Email Worker

Responsible For:

*   Sending emails
    

### Cleanup Worker

Responsible For:

*   Cleanup tasks
    
*   Daily resets
    

Retry Policy
------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Attempt 1  ↓  60 seconds  ↓  Attempt 2  ↓  120 seconds  ↓  Attempt 3  ↓  Failed   `

14\. Email Delivery Architecture
================================

Flow
----

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Recipient  ↓  Load Template  ↓  Replace Variables  ↓  Build MIME Message  ↓  Connect SMTP  ↓  Send Email  ↓  Log Result   `

15\. File Storage Architecture
==============================

Upload Flow
-----------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Frontend  ↓  FastAPI  ↓  Cloudflare R2  ↓  Store Metadata  ↓  Database   `

Stored Assets
-------------

*   PDF
    
*   DOCX
    
*   PNG
    
*   JPG
    

16\. Authentication Architecture
================================

Login Flow
----------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Login  ↓  Verify Password  ↓  Generate JWT  ↓  Generate Refresh Token  ↓  Return Session   `

Access Token
------------

Expiration:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   15 Minutes   `

Refresh Token
-------------

Expiration:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   7 Days   `

17\. Environment Variables
==========================

Backend
-------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   DATABASE_URL=  REDIS_URL=  SECRET_KEY=  FERNET_KEY=  R2_ENDPOINT=  R2_ACCESS_KEY=  R2_SECRET_KEY=  R2_BUCKET=  ENVIRONMENT=   `

Frontend
--------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   NEXT_PUBLIC_API_URL=   `

18\. Deployment Architecture
============================

Frontend Deployment
-------------------

Platform:

Vercel

Trigger:

Git Push

Backend Deployment
------------------

Platform:

Railway

Trigger:

Git Push

Worker Deployment
-----------------

Platform:

Railway

Separate Service:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   mailflow-worker   `

19\. Local Development Architecture
===================================

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   services:  frontend  backend  postgres  redis  worker   `

20\. Monitoring Architecture
============================

Health Endpoint
---------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   GET /health   `

Response:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {    "status":"healthy"  }   `

Metrics
-------

Track:

*   Total Users
    
*   Campaigns
    
*   Sent Emails
    
*   Failed Emails
    
*   Queue Size
    

Error Tracking
--------------

Capture:

*   SMTP Errors
    
*   API Errors
    
*   Worker Failures
    

21\. Logging Strategy
=====================

Application Logs
----------------

Store:

*   Requests
    
*   Errors
    
*   Worker Activity
    

Audit Logs
----------

Store:

*   Login Events
    
*   SMTP Changes
    
*   Campaign Launches
    

22\. Rate Limiting
==================

Authentication
--------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   5 requests/minute   `

CSV Upload
----------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   10 requests/minute   `

Campaign Launch
---------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   5 requests/minute   `

23\. Performance Targets
========================

API Response
------------

Target:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   < 300ms   `

Dashboard Load
--------------

Target:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   < 2 seconds   `

Campaign Creation
-----------------

Target:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   < 5 seconds   `

24\. Scalability Plan
=====================

Stage 1
-------

Users:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   1 – 20   `

Single Worker

Stage 2
-------

Users:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   20 – 100   `

Three Workers

Stage 3
-------

Users:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   100 – 500   `

Dedicated Worker Cluster

Stage 4
-------

Users:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   500+   `

Microservice Architecture

25\. Backup Strategy
====================

Database
--------

Daily Backups

Retention:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   30 Days   `

Attachments
-----------

Stored in Cloudflare R2

26\. Disaster Recovery
======================

Database Failure
----------------

Restore Latest Backup

Worker Failure
--------------

Automatic Restart

Redis Failure
-------------

Reconnect Automatically

27\. Architecture Decisions
===========================

Why FastAPI
-----------

*   Fast
    
*   Async
    
*   Python Ecosystem
    

Why PostgreSQL
--------------

*   Reliable
    
*   Mature
    
*   Scalable
    

Why Redis
---------

*   Fast Queue Broker
    
*   Rate Limiting
    

Why Celery
----------

*   Proven Background Processing
    

Why Cloudflare R2
-----------------

*   Low Cost
    
*   S3 Compatible
    

Why Next.js
-----------

*   Fast Development
    
*   SEO Ready
    
*   Production Ready
    

28\. MVP Architecture Definition
================================

The MVP architecture consists of:

*   Next.js Frontend
    
*   FastAPI Backend
    
*   PostgreSQL
    
*   Redis
    
*   Celery
    
*   Cloudflare R2
    
*   Railway
    
*   Vercel
    

No additional services are required before launch.

End of Document
===============

MailFlow Technical Architecture Document
========================================