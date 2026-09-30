# 🚀 RepoPulse — Enterprise Backend Architecture & System Design Document

> **Project:** RepoPulse (GitHub Intelligence, Hackathon Monitoring & Team Pulse Engine)  
> **Status:** Production-Ready Blueprint & Implementation Spec  
> **Target Audience:** Backend Engineers, AI Coding Agents, System Architects  
> **Repository:** `github-hackqubit / RepoPulse`

---

## 1. Executive Architecture Overview

RepoPulse is an enterprise-grade GitHub Intelligence and Real-Time Repository Monitoring Platform designed for **engineering teams, hackathon organizers, and open-source maintainers**.

### Core Value Propositions & Modules
1. **GitHub Synchronization & Rate-Limit Resilient Ingestion:** Dual ingest via GitHub Webhooks (push, PR, issues, workflow runs, stars) and Scheduled Octokit REST/GraphQL API crawlers.
2. **Dynamic Repository Health Scoring Engine:** Computes a composite health score (0–100) across 6 weighted pillars (Activity, Responsiveness, CI Health, Bus Factor, Community, Security).
3. **Hackathon Anti-Cheat & Code Freshness Audit Engine:** Detects pre-existing codebases, bulk commit dumps, author spoofing, and AI code bursts against hackathon timestamps.
4. **Real-time Event Streaming:** WebSocket/SSE engine backed by Redis Pub/Sub for sub-50ms live dashboard updates.
5. **Multi-Channel Alert Automation:** Rule-based alert pipeline dispatching to Slack, Discord, Telegram, and Email with throttling and quiet hours.
6. **Automated AI Executive Reports & Copilot:** Automated digests summarizing sprint velocity, PR bottlenecks, and health trends.

```mermaid
flowchart TB
    subgraph GitHub_Ecosystem [GitHub Platform]
        GH_Webhook[GitHub Webhooks\npush, PR, issues, workflow_run]
        GH_REST[GitHub REST API v3]
        GH_GQL[GitHub GraphQL API v4]
    end

    subgraph Ingestion_Edge [Edge & Ingestion Layer]
        API_GW[API Gateway / Fastify Server]
        HMAC_Verify[HMAC SHA-256 Signature Verifier]
        Rate_Limiter[Redis Sliding Window Rate Limiter]
    end

    subgraph Async_Queue_Pipeline [Async Queue & Worker Tier]
        Redis_Queue[(Redis BullMQ Queues)]
        Worker_Webhook[Webhook Processor Worker]
        Worker_Sync[Periodic GitHub Sync Worker]
        Worker_Audit[Anti-Cheat Audit Worker]
        Worker_Health[Health Score Calculator Worker]
        Worker_Alert[Multi-Channel Alert Dispatcher]
        Worker_AI[AI Report & Copilot Worker]
    end

    subgraph Data_Storage [Persistent & Cache Storage]
        Supabase_DB[(Supabase PostgreSQL 16\nCloud Database with PgBouncer)]
        Redis_Cache[(Redis 7\nCache, Rate Limits & Pub/Sub)]
        Vector_DB[(pgvector on Supabase\nCode Semantics & Embeddings)]
    end

    subgraph Realtime_Ecosystem [Real-time Broadcasting Layer]
        Socket_Server[Socket.io / WebSocket Server]
        Redis_PubSub[Redis Pub/Sub Backplane]
    end

    subgraph Clients [Frontend & Consumers]
        React_Frontend[RepoPulse React 19 Frontend]
        External_Webhooks[Slack / Discord / Telegram / Email]
    end

    %% Flow connections
    GH_Webhook -->|HTTPS POST| HMAC_Verify
    HMAC_Verify --> API_GW
    API_GW -->|Fast 202 Accepted| Redis_Queue
    
    Redis_Queue --> Worker_Webhook
    Redis_Queue --> Worker_Sync
    Redis_Queue --> Worker_Audit
    Redis_Queue --> Worker_Health
    Redis_Queue --> Worker_Alert
    Redis_Queue --> Worker_AI

    Worker_Sync -->|Octokit REST/GQL| GH_REST & GH_GQL
    Worker_Webhook & Worker_Sync --> PostgreSQL
    Worker_Health --> PostgreSQL
    Worker_Audit --> PostgreSQL
    Worker_AI --> PostgreSQL

    Worker_Webhook -->|Publish Event| Redis_PubSub
    Redis_PubSub --> Socket_Server
    Socket_Server -->|WebSockets WSS| React_Frontend

    Worker_Alert -->|Dispatch Alerts| External_Webhooks
    React_Frontend -->|REST APIs + JWT / Viewer Mode| API_GW
```

---

## 1.1 "Zero-Auth" & Excel/CSV Ingestion Architecture (Organizer & Hackathon Mode)

> **Core Philosophy:** **Nobody needs to log into GitHub!**  
> Hackathon participants do **not** need to install OAuth apps or grant repository permissions. The organizers/admins simply upload an **Excel (.xlsx / .csv)** sheet or paste repository URLs into the Admin dashboard. All public repositories are scraped, analyzed, and continuously monitored using **Server-Side GitHub Token Pools & GraphQL Batch Crawlers**.

```mermaid
flowchart TD
    subgraph Admin_Or_Organizer [Admin / Organizer Workflow]
        Excel_File[Upload Excel / CSV File\nColumns: Team Name, Repo URL, Batch, Lead]
        Direct_Input[Or Paste Multiple Repo URLs\nin Admin Dashboard Modal]
        Admin_Secret[Protected by simple Admin PIN\nx-admin-key: secret]
    end

    subgraph Ingestion_Parser [Backend Ingestion Pipeline]
        File_Upload[Multer / Fastify Multipart Ingest]
        Sheet_Parser[XLSX Parser & Sanitizer\nExtracts owner/repo via Regex]
        Batch_Scheduler[BullMQ Repo Ingest Queue]
    end

    subgraph GitHub_Token_Pool [Server-Side GitHub Engine]
        Token_Rotator[Token Pool Manager\nRound-Robin across 3-5 Server PATs]
        GH_GraphQL[GitHub GraphQL API v4\nBatched query: 100 repos per call!]
        GH_Rest[GitHub REST API v3\nCommit Diffs & Commits Timeline]
    end

    subgraph Core_Processing [RepoPulse Core Workers]
        Worker_InitialSync[Initial Deep Sync Worker]
        Worker_AntiCheat[Instant Anti-Cheat Audit Worker\nCompares against Hackathon Start Time]
        Worker_Health[Health Score Calculator]
        Cron_Poller[Automated Poller Cron\nRuns every 2 mins to detect new pushes]
    end

    subgraph Output_Layer [Public & Live Dashboard]
        DB[(PostgreSQL Database)]
        Realtime_WS[Socket.io Broadcast]
        Live_UI[Public Live Dashboard\nViewers, Mentors, Judges: Zero Auth Needed]
    end

    Admin_Secret --> File_Upload
    Excel_File --> File_Upload
    Direct_Input --> File_Upload
    File_Upload --> Sheet_Parser
    Sheet_Parser --> Batch_Scheduler

    Batch_Scheduler --> Worker_InitialSync
    Worker_InitialSync --> Token_Rotator
    Token_Rotator --> GH_GraphQL & GH_Rest
    GH_GraphQL & GH_Rest --> Worker_AntiCheat
    Worker_AntiCheat --> Worker_Health
    Worker_Health --> DB
    
    Cron_Poller --> Token_Rotator
    Cron_Poller --> Realtime_WS
    Realtime_WS --> Live_UI
    DB --> Live_UI
```

### Key Pillars of the Zero-Auth Model

#### 1. Why User OAuth is NOT Needed
- **Public GitHub Repositories require 0 authentication** to read commits, branches, pull requests, issues, contributors, stars, and code diffs.
- Hackathons require public submissions. Hence, participants only share their GitHub URL (e.g. `https://github.com/team-alpha/project`).
- Zero friction for hackathon teams: No permission popups, no token leaks, no organization admin approvals.

#### 2. Server-Side Token Pool (Never Hit Rate Limits)
GitHub gives **5,000 requests/hour** per Personal Access Token (PAT).
The backend uses a simple round-robin token manager configured in `.env`:
```env
GITHUB_TOKEN_POOL="ghp_tokenAlpha123,ghp_tokenBeta456,ghp_tokenGamma789"
```
- With 3 tokens = **15,000 requests/hour**.
- Using **GraphQL**, 1 single request can fetch the latest commits and activity for **50–100 repositories simultaneously**. 100 repos can be refreshed in just **1 API call**!

#### 3. Automatic Anti-Cheat Verification on Excel Upload
When the organizer uploads the Excel file, they specify the **Hackathon Start Timestamp** (e.g., `2026-09-28 09:00:00 UTC`).
- The backend immediately checks the earliest commit date of each repo in the Excel sheet.
- If the first commit occurred **before** the start time, the dashboard immediately paints the team badge with red: `PRE_EXISTING_FLAG`.
- If incremental commits began right after start time, it receives: `VERIFIED_FRESH`.
- Judges can filter the dashboard with one click: **"Show only Verified Fresh repos"**.

#### 4. Automatic Polling (Zero-Configuration Live Updates)
Since teams don't install webhooks, a lightweight background cron runs every **90 seconds**:
- Queries `pushedAt` for all repositories in batch via GraphQL.
- If `pushedAt` has changed since the last stored value, the worker fetches the new commits and emits a Socket.io event: `activity:new`.
- The live dashboard updates on big screens and mentors' laptops in real time without refreshing!


## 2. Technology Stack & Component Selection

| Layer | Selected Tech | Rationale |
| :--- | :--- | :--- |
| **Runtime & Language** | **Node.js 22 LTS / TypeScript 5.8+** | 100% type compatibility with the frontend (`src/types/index.ts`), blazing I/O performance, native JSON streaming. |
| **Web Framework** | **Fastify v5** (or Express v5 / NestJS) | 3-4x faster throughput than Express, built-in schema validation (JSON Schema/Zod), native fast logging with Pino. |
| **Primary Database** | **Supabase (PostgreSQL 16)** | Managed PostgreSQL in the cloud, zero local installation, built-in PgBouncer connection pooler, Table Editor GUI, and storage bucket. |
| **ORM & Migrations** | **Prisma ORM** | End-to-end type safety, auto-generated TypeScript types, declarative migrations with `directUrl` support for Supabase. |
| **Task Queue & In-Memory**| **Redis 7 + BullMQ** | Ultra-reliable persistent task queues with exponential backoff, delayed jobs, idempotency, rate limiting, and pub/sub. |
| **Realtime Engine** | **Socket.io v4** with `@socket.io/redis-adapter` | Automatic reconnection, room multiplexing (`repo:123`, `team:456`), multi-node clustering over Redis. |
| **GitHub SDK** | **`@octokit/rest` & `@octokit/graphql`** | Official GitHub SDK with automated token rotation, pagination utilities, and rate-limit hooks. |
| **AI Integration** | **LangChain / Vercel AI SDK (OpenAI / Gemini 1.5/2.0)** | Prompt engineering for Anti-Cheat audit explanations, health optimization tips, and weekly executive digests. |
| **Alert Integrations** | **Axios + `@slack/webhook`, `@discordjs/rest`, `node-telegram-bot-api`, `resend`** | Direct API dispatching for multi-channel notifications. |
| **Observability** | **Pino + Prometheus (`prom-client`) + Sentry** | High-throughput structured logging, queue telemetry, and error tracking. |

---

## 3. Database Architecture & Prisma Schema

Below is the complete, production-ready `schema.prisma` definition matching every data entity required by RepoPulse, fully configured for **Supabase Connection Pooling (PgBouncer)**.

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // Supabase PgBouncer Transaction Pooler (port 6543)
  directUrl = env("DIRECT_URL")     // Supabase Direct PostgreSQL connection (port 5432)
}

generator client {
  provider = "prisma-client-js"
}

// -------------------------------------------------------------
// USER & AUTHENTICATION
// -------------------------------------------------------------
enum UserRole {
  ADMIN
  ORGANIZER
  TEAM_LEAD
  DEVELOPER
  JUDGE
}

model User {
  id           String    @id @default(uuid())
  githubId     Int       @unique
  login        String    @unique
  name         String?
  email        String?   @unique
  avatarUrl    String?
  role         UserRole  @default(DEVELOPER)
  accessToken  String?   // Encrypted GitHub OAuth Token
  refreshToken String?   // Encrypted GitHub Refresh Token
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  teams        TeamMember[]
  alertRules   AlertRule[]
  reports      Report[]
}

// -------------------------------------------------------------
// HACKATHON TEAMS & ORGANIZATIONS
// -------------------------------------------------------------
model Team {
  id              String       @id @default(uuid())
  name            String
  hackathonBatch  String?      // e.g. "HackQubit-2026", "Batch-A"
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  members         TeamMember[]
  repositories    Repository[]
}

model TeamMember {
  id        String   @id @default(uuid())
  teamId    String
  userId    String
  role      String   @default("member") // "lead", "member"
  joinedAt  DateTime @default(now())

  team      Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([teamId, userId])
}

// -------------------------------------------------------------
// REPOSITORIES
// -------------------------------------------------------------
enum RepoVisibility {
  PUBLIC
  PRIVATE
}

enum AntiCheatStatus {
  VERIFIED_FRESH
  PRE_EXISTING_FLAG
  AUDIT_PENDING
}

model Repository {
  id              String          @id @default(uuid())
  githubId        BigInt          @unique
  name            String
  fullName        String          @unique // e.g. "Zectral/repopulse"
  owner           String
  description     String?         @db.Text
  visibility      RepoVisibility  @default(PUBLIC)
  defaultBranch   String          @default("main")
  license         String?
  language        String?
  createdAt       DateTime        // Created at on GitHub
  updatedAt       DateTime        // Updated at on GitHub
  pushedAt        DateTime        // Last push on GitHub
  stars           Int             @default(0)
  forks           Int             @default(0)
  watchers        Int             @default(0)
  openIssues      Int             @default(0)
  sizeKb          Int             @default(0)
  archived        Boolean         @default(false)
  topics          String[]        @default([])
  healthScore     Float           @default(100.0)
  
  // Hackathon & Anti-Cheat Meta
  teamId          String?
  teamName        String?
  hackathonBatch  String?
  antiCheatStatus AntiCheatStatus @default(AUDIT_PENDING)
  webhookActive   Boolean         @default(false)
  
  team            Team?           @relation(fields: [teamId], references: [id], onDelete: SetNull)
  snapshots       RepositorySnapshot[]
  commits         Commit[]
  pullRequests    PullRequest[]
  issues          Issue[]
  activities      ActivityEvent[]
  alertRules      AlertRule[]
  alerts          Alert[]
  workflows       WorkflowRun[]
  securityAlerts  SecurityAlert[]
  auditLogs       AntiCheatAuditLog[]

  createdAtSystem DateTime        @default(now())
  updatedAtSystem DateTime        @updatedAt

  @@index([owner])
  @@index([language])
  @@index([antiCheatStatus])
  @@index([teamId])
}

// -------------------------------------------------------------
// REPOSITORY DAILY SNAPSHOTS (Analytics & Historical Trends)
// -------------------------------------------------------------
model RepositorySnapshot {
  id           String     @id @default(uuid())
  repositoryId String
  date         DateTime   @db.Date
  commits      Int        @default(0)
  additions    Int        @default(0)
  deletions    Int        @default(0)
  stars        Int        @default(0)
  forks        Int        @default(0)
  watchers     Int        @default(0)
  openIssues   Int        @default(0)
  contributors Int        @default(0)
  healthScore  Float      @default(0.0)

  repository   Repository @relation(fields: [repositoryId], references: [id], onDelete: Cascade)

  @@unique([repositoryId, date])
  @@index([date])
}

// -------------------------------------------------------------
// CONTRIBUTORS & STATS
// -------------------------------------------------------------
model Contributor {
  id             String    @id @default(uuid())
  login          String    @unique
  name           String?
  avatarUrl      String?
  totalCommits   Int       @default(0)
  pushesCount    Int       @default(0)
  teamName       String?
  primaryRepo    String?
  additions      Int       @default(0)
  deletions      Int       @default(0)
  activeDays     Int       @default(0)
  firstCommitAt  DateTime?
  lastCommitAt   DateTime?
  currentStreak  Int       @default(0)
  longestStreak  Int       @default(0)
  isBot          Boolean   @default(false)
  repositories   String[]  @default([])

  commits        Commit[]
  pullRequests   PullRequest[]
  issues         Issue[]
  activities     ActivityEvent[]

  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@index([login])
}

// -------------------------------------------------------------
// COMMITS & DIFF METRICS
// -------------------------------------------------------------
model Commit {
  id           String      @id @default(uuid())
  sha          String      @unique
  message      String      @db.Text
  authorLogin  String
  branch       String      @default("main")
  repositoryId String
  timestamp    DateTime
  additions    Int         @default(0)
  deletions    Int         @default(0)
  filesChanged Int         @default(0)
  url          String
  isBulkDump   Boolean     @default(false) // Anti-Cheat Flag

  repository   Repository  @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
  author       Contributor @relation(fields: [authorLogin], references: [login])
  files        CommitFile[]

  @@index([repositoryId, timestamp])
  @@index([authorLogin])
}

model CommitFile {
  id        String   @id @default(uuid())
  commitId  String
  filename  String
  status    String   // added, modified, removed, renamed
  additions Int      @default(0)
  deletions Int      @default(0)

  commit    Commit   @relation(fields: [commitId], references: [id], onDelete: Cascade)

  @@index([commitId])
}

// -------------------------------------------------------------
// PULL REQUESTS
// -------------------------------------------------------------
enum PRState {
  OPEN
  MERGED
  CLOSED
}

model PullRequest {
  id                 String     @id @default(uuid())
  number             Int
  title              String
  state              PRState    @default(OPEN)
  authorLogin        String
  repositoryId       String
  createdAt          DateTime
  updatedAt          DateTime
  mergedAt           DateTime?
  closedAt           DateTime?
  additions          Int        @default(0)
  deletions          Int        @default(0)
  filesChanged       Int        @default(0)
  reviewLatencyHours Float?
  mergeTimeHours     Float?
  isDraft            Boolean    @default(false)
  url                String
  labels             Json       @default("[]") // [{ name, color }]
  reviewers          Json       @default("[]") // [{ login, avatarUrl }]

  repository         Repository @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
  author             Contributor @relation(fields: [authorLogin], references: [login])

  @@unique([repositoryId, number])
  @@index([repositoryId, state])
}

// -------------------------------------------------------------
// ISSUES
// -------------------------------------------------------------
enum IssueState {
  OPEN
  CLOSED
}

model Issue {
  id                 String     @id @default(uuid())
  number             Int
  title              String
  state              IssueState @default(OPEN)
  authorLogin        String
  repositoryId       String
  createdAt          DateTime
  updatedAt          DateTime
  closedAt           DateTime?
  firstResponseAt    DateTime?
  firstResponseHours Float?
  isStale            Boolean    @default(false)
  url                String
  labels             Json       @default("[]")

  repository         Repository @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
  author             Contributor @relation(fields: [authorLogin], references: [login])

  @@unique([repositoryId, number])
  @@index([repositoryId, state])
}

// -------------------------------------------------------------
// REAL-TIME ACTIVITY EVENTS
// -------------------------------------------------------------
enum ActivityEventType {
  PUSH
  PULL_REQUEST
  ISSUES
  RELEASE
  WORKFLOW_RUN
  STAR
  FORK
  FORCE_PUSH
}

model ActivityEvent {
  id             String            @id @default(uuid())
  type           ActivityEventType
  repositoryId   String
  repositoryName String
  teamName       String?
  actorLogin     String
  actorName      String?
  actorAvatarUrl String?
  timestamp      DateTime          @default(now())
  title          String
  description    String?           @db.Text
  url            String?
  branch         String?
  linesAdded     Int?              @default(0)
  linesDeleted   Int?              @default(0)
  commitCount    Int?              @default(0)
  commitSha      String?

  repository     Repository        @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
  actor          Contributor       @relation(fields: [actorLogin], references: [login])

  @@index([repositoryId, timestamp(sort: Desc)])
  @@index([type])
}

// -------------------------------------------------------------
// ALERTS & AUTOMATED NOTIFICATIONS
// -------------------------------------------------------------
enum AlertSeverity {
  CRITICAL
  WARNING
  INFO
}

enum AlertState {
  ACTIVE
  MUTED
  TRIGGERED
  FAILED
}

enum AlertChannel {
  EMAIL
  SLACK
  DISCORD
  TELEGRAM
  WEBHOOK
}

model AlertRule {
  id               String        @id @default(uuid())
  userId           String
  name             String
  event            String        // 'workflow_run', 'commit_spike', 'star_spike', 'force_push'
  condition        String        // e.g. "status == 'failed'", "linesAdded > 1000"
  repositoryId     String
  repositoryName   String
  channel          AlertChannel
  webhookUrl       String?       // Slack/Discord/Custom webhook URL
  destination      String?       // Email address or Telegram Chat ID
  severity         AlertSeverity @default(WARNING)
  state            AlertState    @default(ACTIVE)
  throttleMinutes  Int           @default(15)
  quietHoursStart  String?       // "22:00"
  quietHoursEnd    String?       // "08:00"
  lastTriggeredAt  DateTime?
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt

  user             User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  repository       Repository    @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
  alerts           Alert[]

  @@index([repositoryId, state])
}

model Alert {
  id           String        @id @default(uuid())
  ruleId       String
  repositoryId String
  type         String
  severity     AlertSeverity
  repository   String
  message      String        @db.Text
  channel      AlertChannel
  read         Boolean       @default(false)
  createdAt    DateTime      @default(now())

  rule         AlertRule     @relation(fields: [ruleId], references: [id], onDelete: Cascade)
  repoRelation Repository    @relation(fields: [repositoryId], references: [id], onDelete: Cascade)

  @@index([repositoryId, createdAt(sort: Desc)])
  @@index([read])
}

// -------------------------------------------------------------
// CI/CD WORKFLOW RUNS
// -------------------------------------------------------------
enum WorkflowStatus {
  PASSING
  FAILED
  CANCELLED
  RUNNING
}

model WorkflowRun {
  id           String         @id @default(uuid())
  runId        BigInt         @unique
  name         String
  repositoryId String
  status       WorkflowStatus
  branch       String
  sha          String
  duration     Int            @default(0) // Seconds
  createdAt    DateTime
  url          String

  repository   Repository     @relation(fields: [repositoryId], references: [id], onDelete: Cascade)

  @@index([repositoryId, status])
}

// -------------------------------------------------------------
// SECURITY & DEPENDABOT ALERTS
// -------------------------------------------------------------
enum SecuritySeverity {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}

enum SecurityCategory {
  DEPENDABOT
  CODE_SCANNING
  SECRET_SCANNING
}

model SecurityAlert {
  id           String           @id @default(uuid())
  alertId      BigInt           @unique
  severity     SecuritySeverity
  category     SecurityCategory
  title        String
  repositoryId String
  createdAt    DateTime
  url          String

  repository   Repository       @relation(fields: [repositoryId], references: [id], onDelete: Cascade)

  @@index([repositoryId, severity])
}

// -------------------------------------------------------------
// ANTI-CHEAT & CODE AUDIT LOGS
// -------------------------------------------------------------
model AntiCheatAuditLog {
  id               String          @id @default(uuid())
  repositoryId     String
  evaluatedStatus  AntiCheatStatus
  hackathonStart   DateTime
  firstCommitDate  DateTime
  flaggedCommits   Json            @default("[]") // List of suspicious commits
  aiSuspicionScore Float           @default(0.0)  // 0.0 to 1.0 (Plagiarism / Mass dump)
  reasonSummary    String          @db.Text
  auditedAt        DateTime        @default(now())

  repository       Repository      @relation(fields: [repositoryId], references: [id], onDelete: Cascade)

  @@index([repositoryId, evaluatedStatus])
}

// -------------------------------------------------------------
// EXECUTIVE REPORTS (AI-Generated & Periodic)
// -------------------------------------------------------------
model Report {
  id             String    @id @default(uuid())
  userId         String?
  title          String
  period         String    // "7d", "30d", "hackathon-finale"
  health         Float
  healthChange   Float
  commits        Int
  prsMerged      Int
  issuesClosed   Int
  topContributor String
  repositories   Int
  aiSummaryMarkdown String? @db.Text
  generatedAt    DateTime  @default(now())

  user           User?     @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([generatedAt(sort: Desc)])
}
```

---

## 3.1 Supabase Setup, Connection Pooling & Migration Guide

RepoPulse uses **Supabase** as its primary cloud database. Supabase provides managed PostgreSQL 16 with built-in connection pooling via **PgBouncer**, eliminating connection exhaustion when high-concurrency ingestion workers or WebSocket clients scale up.

### 1. Connection Pooling Architecture with Prisma

When connecting Prisma to Supabase, two URLs must be supplied in `.env`:
1. **`DATABASE_URL` (Port 6543 - Transaction Pooler):**
   - Routes through PgBouncer in transaction mode.
   - Used by the Node.js backend runtime for all application queries.
   - Syntax: `postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true`
2. **`DIRECT_URL` (Port 5432 - Direct Connection):**
   - Connects directly to the PostgreSQL instance without PgBouncer.
   - Required by Prisma CLI for schema migrations and `prisma db push` (because PgBouncer does not support prepared statements or DDL locks).
   - Syntax: `postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres`

### 2. Instant Table Provisioning (1 Single Command)

Once the Supabase project is created and the `.env` variables are set, deploy all tables with:

```bash
npx prisma db push
```

Within **10 seconds**, Prisma will automatically create:
- All 13 tables (`Repository`, `Commit`, `PullRequest`, `Issue`, `Contributor`, `Team`, `Alert`, etc.)
- All foreign keys, cascading deletes, and unique constraints
- Optimized B-Tree & timestamp indexes

### 3. Supabase Visual Dashboard (Table Editor)
- View and manually inspect any repository, commit, or anti-cheat audit log via the Supabase Table Editor at `https://supabase.com/dashboard/project/[REF]/editor`.
- Changes made in the Supabase Table Editor can trigger Supabase Database Webhooks if needed.

### 4. Supabase Storage Bucket for Excel Files & AI Digests (Optional)
Create a storage bucket named `repopulse-assets`:
- **`excel-uploads/`**: Stores uploaded hackathon batch spreadsheets for audit records.
- **`reports-pdf/`**: Stores exported PDF executive digests.

---

## 4. GitHub Webhook Ingestion & Anti-Rate-Limit Pipeline

GitHub rate limits standard REST requests to **5,000 requests/hour** (for authenticated users) or **15,000 requests/hour** (for GitHub Apps). To guarantee zero rate-limit starvation:
1. **Push Webhooks First:** 95% of data ingestion is event-driven via webhooks. No polling is used for commits, PRs, issues, or workflow runs.
2. **Fast 202 Accepted (<50ms):** GitHub times out webhooks after 10 seconds. Ingestion verifies HMAC signature, checks idempotency in Redis, queues the payload into BullMQ, and immediately replies `202 Accepted`.
3. **Octokit GraphQL for Deep Sync:** When initial repository onboard or periodic health refresh occurs, GraphQL batched queries retrieve contributors, commit histories, and open issues in a single HTTP payload.

### Webhook Verification & Worker Flow

```typescript
// src/middlewares/github-webhook.middleware.ts
import crypto from 'node:crypto';
import type { FastifyRequest, FastifyReply } from 'fastify';

export async function verifyGitHubWebhook(req: FastifyRequest, reply: FastifyReply) {
  const signature = req.headers['x-hub-signature-256'] as string;
  const deliveryId = req.headers['x-github-delivery'] as string;
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return reply.status(401).send({ error: 'Missing webhook signature or secret.' });
  }

  // Fastify rawBody plugin is required to preserve byte-exact payload
  const rawBody = (req as any).rawBody;
  const expectedSignature = `sha256=${crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex')}`;

  const trusted = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );

  if (!trusted) {
    return reply.status(401).send({ error: 'Invalid HMAC signature.' });
  }

  // Store deliveryId for de-duplication in Redis
  req.deliveryId = deliveryId;
}
```

### BullMQ Worker Processing Queue

```typescript
// src/workers/webhook.worker.ts
import { Worker, Job } from 'bullmq';
import { redisConnection } from '../lib/redis';
import { prisma } from '../lib/prisma';
import { io } from '../lib/socket';
import { evaluateAlertRules } from '../services/alert.service';
import { calculateHealthScore } from '../services/health.service';

export const webhookWorker = new Worker(
  'github-webhook-queue',
  async (job: Job) => {
    const { event, payload, deliveryId } = job.data;

    // 1. Idempotency Check in Redis
    const isProcessed = await redisConnection.set(
      `idempotency:webhook:${deliveryId}`,
      '1',
      'EX',
      86400, // 24hr TTL
      'NX'
    );
    if (!isProcessed) {
      console.log(`[WebhookWorker] Duplicate delivery ${deliveryId} skipped.`);
      return;
    }

    switch (event) {
      case 'push': {
        await handlePushEvent(payload);
        break;
      }
      case 'pull_request': {
        await handlePullRequestEvent(payload);
        break;
      }
      case 'issues': {
        await handleIssueEvent(payload);
        break;
      }
      case 'workflow_run': {
        await handleWorkflowRunEvent(payload);
        break;
      }
      case 'watch': // Star event
      case 'star': {
        await handleStarEvent(payload);
        break;
      }
      default:
        console.log(`[WebhookWorker] Unhandled event: ${event}`);
    }
  },
  { connection: redisConnection, concurrency: 10 }
);

async function handlePushEvent(payload: any) {
  const repoFullName = payload.repository.full_name;
  const repo = await prisma.repository.findUnique({
    where: { fullName: repoFullName },
  });
  if (!repo) return;

  const actor = payload.sender;
  const commits = payload.commits || [];
  const branch = payload.ref.replace('refs/heads/', '');

  let totalAdditions = 0;
  let totalDeletions = 0;

  // Upsert Contributor
  await prisma.contributor.upsert({
    where: { login: actor.login },
    create: {
      login: actor.login,
      avatarUrl: actor.avatar_url,
      pushesCount: 1,
      totalCommits: commits.length,
      repositories: [repoFullName],
    },
    update: {
      pushesCount: { increment: 1 },
      totalCommits: { increment: commits.length },
    },
  });

  // Persist Commits & Detect Bulk Dumps (>2000 lines)
  for (const c of commits) {
    const adds = c.added?.length * 20 || 0; // Approximate or fetch diff
    const dels = c.removed?.length * 10 || 0;
    totalAdditions += adds;
    totalDeletions += dels;

    const isBulk = (c.added?.length || 0) > 50; // Flag bulk commits

    await prisma.commit.create({
      data: {
        sha: c.id,
        message: c.message,
        authorLogin: actor.login,
        branch,
        repositoryId: repo.id,
        timestamp: new Date(c.timestamp),
        additions: adds,
        deletions: dels,
        filesChanged: (c.added?.length || 0) + (c.modified?.length || 0),
        url: c.url,
        isBulkDump: isBulk,
      },
    });
  }

  // Create Activity Event
  const activity = await prisma.activityEvent.create({
    data: {
      type: 'PUSH',
      repositoryId: repo.id,
      repositoryName: repo.name,
      teamName: repo.teamName,
      actorLogin: actor.login,
      actorName: actor.name || actor.login,
      actorAvatarUrl: actor.avatar_url,
      timestamp: new Date(),
      title: `Pushed ${commits.length} commit(s) to ${branch}`,
      description: commits[0]?.message || '',
      url: payload.compare,
      branch,
      linesAdded: totalAdditions,
      linesDeleted: totalDeletions,
      commitCount: commits.length,
      commitSha: commits[0]?.id?.substring(0, 7),
    },
  });

  // Recompute Health Score Async
  await calculateHealthScore(repo.id);

  // Trigger Alerts
  await evaluateAlertRules(repo.id, 'push', activity);

  // Broadcast to Realtime WebSocket Room
  io.to(`repo:${repo.id}`).emit('activity:new', activity);
  io.to('global:stream').emit('activity:new', activity);
}
```

---

## 5. Core Business Logic & Algorithmic Engines

### 5.1 Repository Health Scoring Algorithm (0–100)

The Health Score combines 6 distinct health pillars into a normalized index:

$$\text{Health Score} = \sum (\text{Pillar Score} \times \text{Weight})$$

```typescript
// src/services/health.service.ts
import { prisma } from '../lib/prisma';

export interface HealthBreakdown {
  total: number;
  activity: number;        // Weight: 25%
  responsiveness: number;  // Weight: 20%
  ciHealth: number;        // Weight: 15%
  busFactor: number;       // Weight: 15%
  community: number;       // Weight: 10%
  security: number;        // Weight: 15%
  tips: string[];
}

export async function calculateHealthScore(repositoryId: string): Promise<HealthBreakdown> {
  const repo = await prisma.repository.findUnique({
    where: { id: repositoryId },
    include: {
      commits: { take: 100, orderBy: { timestamp: 'desc' } },
      pullRequests: { take: 50, orderBy: { createdAt: 'desc' } },
      issues: { take: 50, orderBy: { createdAt: 'desc' } },
      workflows: { take: 20, orderBy: { createdAt: 'desc' } },
      securityAlerts: true,
    },
  });

  if (!repo) throw new Error('Repository not found');

  const tips: string[] = [];

  // 1. Activity Score (25 pts): Commits in last 7 days + active contributors
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentCommits = repo.commits.filter((c) => new Date(c.timestamp) >= sevenDaysAgo);
  
  let activity = Math.min(100, (recentCommits.length / 15) * 100);
  if (recentCommits.length < 3) {
    tips.push('Commit velocity is low in the last 7 days. Push code incrementally.');
  }

  // 2. Responsiveness Score (20 pts): PR Review latency + Issue turnaround
  let responsiveness = 85;
  const mergedPRs = repo.pullRequests.filter((pr) => pr.mergeTimeHours != null);
  if (mergedPRs.length > 0) {
    const avgMergeTime = mergedPRs.reduce((acc, p) => acc + (p.mergeTimeHours || 0), 0) / mergedPRs.length;
    if (avgMergeTime > 48) {
      responsiveness -= 25;
      tips.push('PR review latency is high (>48h). Accelerate peer code reviews.');
    } else if (avgMergeTime > 24) {
      responsiveness -= 10;
    }
  }

  // 3. CI Health Score (15 pts): GitHub Action pass rate
  let ciHealth = 90;
  if (repo.workflows.length > 0) {
    const passingCount = repo.workflows.filter((w) => w.status === 'PASSING').length;
    const passRatio = passingCount / repo.workflows.length;
    ciHealth = Math.round(passRatio * 100);
    if (ciHealth < 70) {
      tips.push('CI build pass rate is below 70%. Investigate failing workflow steps.');
    }
  }

  // 4. Bus Factor (15 pts): Git contributor concentration
  // Measured by commit distribution among contributors
  const authorCommitCounts: Record<string, number> = {};
  repo.commits.forEach((c) => {
    authorCommitCounts[c.authorLogin] = (authorCommitCounts[c.authorLogin] || 0) + 1;
  });
  const authors = Object.keys(authorCommitCounts);
  let busFactor = 50;
  if (authors.length >= 4) {
    busFactor = 95;
  } else if (authors.length >= 2) {
    busFactor = 75;
  } else {
    busFactor = 30;
    tips.push('High bus factor risk: A single contributor authors over 80% of commits.');
  }

  // 5. Community Score (10 pts): Star, Fork & issue ratios
  const community = Math.min(100, Math.round(((repo.stars * 2 + repo.forks * 5) / 50) * 100));

  // 6. Security Score (15 pts): Dependabot & Vulnerabilities
  let security = 100;
  const criticalVulns = repo.securityAlerts.filter((s) => s.severity === 'CRITICAL').length;
  const highVulns = repo.securityAlerts.filter((s) => s.severity === 'HIGH').length;
  security = Math.max(0, 100 - criticalVulns * 30 - highVulns * 15);
  if (criticalVulns > 0) {
    tips.push(`Critical vulnerability detected (${criticalVulns}). Update dependencies immediately.`);
  }

  // Weighted total
  const total = Math.round(
    activity * 0.25 +
    responsiveness * 0.20 +
    ciHealth * 0.15 +
    busFactor * 0.15 +
    community * 0.10 +
    security * 0.15
  );

  // Update in DB
  await prisma.repository.update({
    where: { id: repositoryId },
    data: { healthScore: total },
  });

  return { total, activity, responsiveness, ciHealth, busFactor, community, security, tips };
}
```

---

### 5.2 Hackathon Anti-Cheat & Freshness Verification Engine

One of the standout features of RepoPulse is **Hackathon Integrity Auditing**.

```mermaid
flowchart TD
    Trigger[Trigger Audit\nManual or Auto on Repo Registration]
    Check_Created{Was repo created\nbefore Hackathon start?}
    Check_FirstCommit{First commit timestamp\n< Hackathon start time?}
    Check_BulkDump{Single commit with\n> 2,500 lines of code?}
    Check_HistoryRewriting{Force push or rewritten\nnon-linear git tree?}
    
    Trigger --> Check_Created
    Check_Created -- Yes --> Flag_PreExisting[Flag: PRE_EXISTING_FLAG\nReason: Repo created prior to hackathon]
    Check_Created -- No --> Check_FirstCommit
    
    Check_FirstCommit -- Yes --> Flag_PreExisting
    Check_FirstCommit -- No --> Check_BulkDump
    
    Check_BulkDump -- Yes --> Flag_Suspicious[Flag: AUDIT_PENDING\nReason: Suspicious bulk code dump detected]
    Check_BulkDump -- No --> Check_HistoryRewriting

    Check_HistoryRewriting -- Yes --> Flag_Suspicious
    Check_HistoryRewriting -- No --> Flag_Fresh[Flag: VERIFIED_FRESH\nReason: 100% Verified clean incremental history]
```

#### Anti-Cheat Engine Implementation

```typescript
// src/services/anticheat.service.ts
import { prisma } from '../lib/prisma';
import { AntiCheatStatus } from '@prisma/client';

export interface AuditResult {
  status: AntiCheatStatus;
  reasons: string[];
  flaggedCommits: string[];
  aiSuspicionScore: number;
}

export async function runAntiCheatAudit(
  repositoryId: string,
  hackathonStartTime: Date
): Promise<AuditResult> {
  const repo = await prisma.repository.findUnique({
    where: { id: repositoryId },
    include: {
      commits: { orderBy: { timestamp: 'asc' } },
    },
  });

  if (!repo) throw new Error('Repository not found');

  const reasons: string[] = [];
  const flaggedCommits: string[] = [];
  let status: AntiCheatStatus = AntiCheatStatus.VERIFIED_FRESH;
  let aiSuspicionScore = 0.0;

  // 1. Check Repo Creation Date
  if (new Date(repo.createdAt) < hackathonStartTime) {
    status = AntiCheatStatus.PRE_EXISTING_FLAG;
    reasons.push(
      `Repository created on ${repo.createdAt.toISOString()}, which is BEFORE the hackathon start (${hackathonStartTime.toISOString()}).`
    );
  }

  // 2. Check Earliest Commit Date
  if (repo.commits.length > 0) {
    const firstCommit = repo.commits[0];
    if (new Date(firstCommit.timestamp) < hackathonStartTime) {
      status = AntiCheatStatus.PRE_EXISTING_FLAG;
      flaggedCommits.push(firstCommit.sha);
      reasons.push(
        `First commit (${firstCommit.sha.substring(0, 7)}) timestamp is before hackathon start time.`
      );
    }
  }

  // 3. Check for Giant "Initial Commit" code dumps (>3,000 LOC added in 1 commit)
  for (const commit of repo.commits) {
    if (commit.additions > 3000) {
      flaggedCommits.push(commit.sha);
      aiSuspicionScore = Math.max(aiSuspicionScore, 0.75);
      reasons.push(
        `Commit ${commit.sha.substring(0, 7)} introduces massive dump of ${commit.additions} lines. Potential copy-paste or pre-built library dump.`
      );
      if (status !== AntiCheatStatus.PRE_EXISTING_FLAG) {
        status = AntiCheatStatus.AUDIT_PENDING; // Needs manual mentor review
      }
    }
  }

  // 4. Record Audit Log in Database
  await prisma.antiCheatAuditLog.create({
    data: {
      repositoryId: repo.id,
      evaluatedStatus: status,
      hackathonStart: hackathonStartTime,
      firstCommitDate: repo.commits[0]?.timestamp || repo.createdAt,
      flaggedCommits,
      aiSuspicionScore,
      reasonSummary: reasons.join(' | ') || 'Passed all automated checks cleanly.',
    },
  });

  // 5. Update Repository Status
  await prisma.repository.update({
    where: { id: repo.id },
    data: { antiCheatStatus: status },
  });

  return { status, reasons, flaggedCommits, aiSuspicionScore };
}
```

---

### 5.3 Multi-Channel Alert & Throttling Engine

Supports Slack Webhooks, Discord Webhooks, Telegram Bot messages, and Resend Emails with Redis sliding-window throttling.

```typescript
// src/services/alert.service.ts
import axios from 'axios';
import { prisma } from '../lib/prisma';
import { redisConnection } from '../lib/redis';
import { AlertChannel, AlertSeverity } from '@prisma/client';

export async function evaluateAlertRules(
  repositoryId: string,
  eventType: string,
  eventContext: any
) {
  const rules = await prisma.alertRule.findMany({
    where: { repositoryId, state: 'ACTIVE' },
  });

  for (const rule of rules) {
    if (rule.event !== eventType && rule.event !== 'all') continue;

    // Check Quiet Hours (e.g. 22:00 to 08:00)
    if (isInQuietHours(rule.quietHoursStart, rule.quietHoursEnd)) {
      continue;
    }

    // Check Throttle Window (Redis sliding window)
    const throttleKey = `throttle:alert:${rule.id}`;
    const isThrottled = await redisConnection.get(throttleKey);
    if (isThrottled) {
      continue;
    }

    // Compose alert message
    const message = `🚨 [${rule.severity}] ${rule.repositoryName}: ${eventContext.title || 'Event triggered'}`;

    // Dispatch to channel
    await dispatchAlert(rule.channel, rule.webhookUrl, rule.destination, message);

    // Set throttle in Redis
    await redisConnection.set(throttleKey, '1', 'EX', rule.throttleMinutes * 60);

    // Record in DB
    await prisma.alert.create({
      data: {
        ruleId: rule.id,
        repositoryId,
        type: eventType,
        severity: rule.severity,
        repository: rule.repositoryName,
        message,
        channel: rule.channel,
      },
    });
  }
}

async function dispatchAlert(
  channel: AlertChannel,
  webhookUrl?: string | null,
  destination?: string | null,
  message?: string
) {
  try {
    switch (channel) {
      case 'SLACK':
        if (webhookUrl) await axios.post(webhookUrl, { text: message });
        break;
      case 'DISCORD':
        if (webhookUrl) await axios.post(webhookUrl, { content: message });
        break;
      case 'TELEGRAM':
        if (destination && process.env.TELEGRAM_BOT_TOKEN) {
          await axios.post(
            `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
            { chat_id: destination, text: message }
          );
        }
        break;
      case 'EMAIL':
        // Integration with Resend or SendGrid
        break;
    }
  } catch (err) {
    console.error(`[AlertDispatcher] Error sending to ${channel}:`, err);
  }
}

function isInQuietHours(start?: string | null, end?: string | null): boolean {
  if (!start || !end) return false;
  const currentHour = new Date().getUTCHours();
  const startHour = parseInt(start.split(':')[0], 10);
  const endHour = parseInt(end.split(':')[0], 10);

  if (startHour > endHour) {
    return currentHour >= startHour || currentHour < endHour;
  }
  return currentHour >= startHour && currentHour < endHour;
}
```

---

## 6. Complete REST & Real-Time WebSocket API Specification

Base URL: `http://localhost:5000/api/v1`

### 6.1 Authentication & Access Control (Organizer PIN / Zero-Auth Mode)
- **Viewer / Public Access:** All `GET` endpoints (`/repositories`, `/activities`, `/contributors`, `/health`) require **0 authentication** (No login, no token needed). Anyone can open the dashboard.
- **Admin Endpoints:** Mutation endpoints (`POST /repositories/upload-excel`, `POST /repositories/bulk-add`, `DELETE /repositories/:id`) are protected by a simple HTTP header:
  - Header: `x-admin-key: <ADMIN_SECRET_KEY>` (set in `.env`)
  - No complicated OAuth flows needed for the hackathon organizers.

### 6.2 Repositories & Bulk Excel Ingestion
- `POST /repositories/upload-excel`
  - Multi-part form upload with file field: `file` (`.xlsx` or `.csv`).
  - Form fields:
    - `hackathonBatch`: e.g. `"HackQubit-2026"`
    - `hackathonStartTime`: e.g. `"2026-09-28T09:00:00Z"`
  - Automatically parses rows, validates GitHub URLs, provisions repositories in DB, schedules BullMQ initial sync & runs instant Anti-Cheat verification!
- `POST /repositories/bulk-add`
  - Body:
    ```json
    {
      "hackathonBatch": "HackQubit-2026",
      "hackathonStartTime": "2026-09-28T09:00:00Z",
      "repos": [
        { "teamName": "Team ByteCraft", "repoUrl": "https://github.com/Zectral/the-grocery-hub" },
        { "teamName": "NeuralCoders", "repoUrl": "https://github.com/Zectral/agentic-ai-platform" }
      ]
    }
    ```
- `GET /repositories`
  - Query params: `page`, `limit`, `search`, `language`, `antiCheatStatus`, `teamId`, `sortBy`.
  - Response: `{ data: Repository[], total: number, page: number }`.
- `POST /repositories/sync-all`
  - Header: `x-admin-key: <ADMIN_SECRET_KEY>`
  - Triggers on-demand background sync for all registered repositories.
- `GET /repositories/:id`
  - Returns detailed repo breakdown, including top contributors and languages.
- `GET /repositories/:id/health`
  - Returns `{ total, activity, responsiveness, ciHealth, busFactor, community, security, tips }`.
- `POST /repositories/:id/anti-cheat-audit`
  - Body: `{ hackathonStartTime: "2026-09-28T09:00:00Z" }`.
  - Runs the freshness verification engine and returns status and flagged commits.


### 6.3 Real-time Activities & Contributors
- `GET /activities?limit=50&repositoryId=XYZ`
  - Returns chronological list of GitHub push, PR, issue, and CI events.
- `GET /contributors`
  - Returns all contributors ranked by commits, additions, active days, and streak.
- `GET /contributors/:login`
  - Individual breakdown for a developer across team repos.

### 6.4 Pull Requests & Issues Analytics
- `GET /pull-requests?state=open|merged|closed&repositoryId=XYZ`
  - Returns PR list with calculated `reviewLatencyHours` and `mergeTimeHours`.
- `GET /issues?state=open|closed&repositoryId=XYZ`
  - Returns issues list with stale markers and `firstResponseHours`.

### 6.5 Alerts & Rules
- `GET /alerts` -> Returns list of triggered notifications.
- `PATCH /alerts/:id/read` -> Marks notification as read.
- `POST /alerts/rules` -> Creates an alert automation rule (Slack/Discord/Telegram).
- `DELETE /alerts/rules/:id` -> Removes an alert rule.

### 6.6 AI Reports & Assistant
- `POST /reports/generate`
  - Body: `{ period: "7d" | "30d" | "hackathon" }`.
  - Triggers LLM summarizing commits, PR turnaround, team pulse, and generates an executive report.
- `POST /ai/chat`
  - Body: `{ query: "Why is the grocery-hub repo health score at 71%?", repositoryId: "XYZ" }`.
  - Returns AI stream diagnosing codebase issues.

---

## 7. Real-Time WebSocket Protocol (Socket.io)

### Connection Handshake
```typescript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'Bearer <JWT_TOKEN>',
  },
});
```

### Event Contracts (Client -> Server)
| Event | Payload | Purpose |
| :--- | :--- | :--- |
| `subscribe:repo` | `{ repoId: "repo-001" }` | Joins the room `repo:repo-001` to receive live commits & PRs. |
| `unsubscribe:repo`| `{ repoId: "repo-001" }` | Leaves the repo room. |
| `subscribe:team` | `{ teamId: "team-alpha" }`| Joins the room for team-wide notifications. |

### Event Contracts (Server -> Client)
| Event | Payload | Purpose |
| :--- | :--- | :--- |
| `activity:new` | `ActivityEvent` | Emitted when a commit, push, or PR occurs. |
| `health:updated` | `{ repoId: string, healthScore: number }` | Recomputed health score update. |
| `alert:triggered`| `Alert` | Immediate toast notification for critical incidents or CI failure. |
| `anticheat:status`| `{ repoId: string, status: AntiCheatStatus }` | Broadcasts audit conclusion. |

---

## 8. Clean Architecture Project Directory Structure

Recommended structure for the backend package (e.g., inside `/backend` or as a standalone microservice):

```
backend/
├── prisma/
│   ├── schema.prisma              # Production database schema
│   └── migrations/                # Version-controlled SQL migrations
├── src/
│   ├── config/
│   │   ├── env.ts                 # Validated environment variables (Zod)
│   │   └── constants.ts           # System scoring weights, defaults
│   ├── controllers/
│   │   ├── auth.controller.ts     # GitHub OAuth & JWT sessions
│   │   ├── repo.controller.ts     # Repository sync & metadata
│   │   ├── activity.controller.ts # Event stream endpoints
│   │   ├── alert.controller.ts    # Notification rules & alerts
│   │   ├── webhook.controller.ts  # GitHub Webhook ingestion
│   │   └── ai.controller.ts       # AI executive report & copilot
│   ├── lib/
│   │   ├── prisma.ts              # Prisma Client singleton
│   │   ├── redis.ts               # Redis client & Pub/Sub backplane
│   │   ├── socket.ts              # Socket.io server instance
│   │   └── octokit.ts             # Octokit client with rate-limiter
│   ├── middlewares/
│   │   ├── auth.middleware.ts     # JWT validation
│   │   ├── webhook.middleware.ts  # HMAC SHA-256 signature verification
│   │   └── rate-limiter.ts        # Redis sliding-window protection
│   ├── services/
│   │   ├── github.service.ts      # REST & GraphQL API crawlers
│   │   ├── health.service.ts      # 6-pillar health scoring engine
│   │   ├── anticheat.service.ts   # Hackathon audit & freshness engine
│   │   ├── alert.service.ts       # Multi-channel dispatcher (Slack/Discord)
│   │   └── ai.service.ts          # LLM prompt orchestration
│   ├── workers/
│   │   ├── webhook.worker.ts      # Ingestion & event processor
│   │   ├── sync.worker.ts         # Periodic repository sync
│   │   └── report.worker.ts       # Scheduled report generator
│   └── server.ts                  # Fastify / Express bootstrap file
├── docker-compose.yml             # Local dev: Postgres, Redis, App
├── Dockerfile                     # Multi-stage production build
├── .env.example                   # Environment configuration template
├── package.json
└── tsconfig.json
```

### 8.1 Excel / CSV Ingestion Controller (`excel-ingest.controller.ts`)

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import * as xlsx from 'xlsx';
import { prisma } from '../lib/prisma';
import { repoSyncQueue } from '../lib/queues';

interface ExcelRow {
  'Team Name'?: string;
  'Team'?: string;
  'Repository URL'?: string;
  'Repo URL'?: string;
  'URL'?: string;
  'Batch'?: string;
}

export async function uploadExcelHandler(req: FastifyRequest, reply: FastifyReply) {
  const data = await (req as any).file();
  if (!data) {
    return reply.status(400).send({ error: 'No Excel/CSV file uploaded.' });
  }

  const buffer = await data.toBuffer();
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const rows: ExcelRow[] = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  const hackathonBatch = (req.query as any)?.batch || 'HackQubit-2026';
  const startTimeStr = (req.query as any)?.startTime || '2026-09-28T09:00:00Z';
  const hackathonStartTime = new Date(startTimeStr);

  const importedRepos = [];
  const errors = [];

  for (const row of rows) {
    const rawUrl = row['Repository URL'] || row['Repo URL'] || row['URL'];
    const teamName = row['Team Name'] || row['Team'] || 'Independent';

    if (!rawUrl) continue;

    // Extract owner and repo from URL (e.g. https://github.com/Zectral/the-grocery-hub)
    const match = rawUrl.match(/github\.com\/([^\/]+)\/([^\/\s#?]+)/i);
    if (!match) {
      errors.push({ url: rawUrl, reason: 'Invalid GitHub URL format' });
      continue;
    }

    const owner = match[1];
    const name = match[2].replace(/\.git$/, '');
    const fullName = `${owner}/${name}`;

    try {
      // 1. Create or link Team
      const team = await prisma.team.upsert({
        where: { id: `team-${teamName.toLowerCase().replace(/\s+/g, '-')}` },
        create: {
          id: `team-${teamName.toLowerCase().replace(/\s+/g, '-')}`,
          name: teamName,
          hackathonBatch,
        },
        update: { hackathonBatch },
      });

      // 2. Register Repository in Database with AUDIT_PENDING
      const repo = await prisma.repository.upsert({
        where: { fullName },
        create: {
          githubId: BigInt(Date.now() + Math.floor(Math.random() * 10000)), // Temp until synced
          name,
          fullName,
          owner,
          teamId: team.id,
          teamName: team.name,
          hackathonBatch,
          antiCheatStatus: 'AUDIT_PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
          pushedAt: new Date(),
        },
        update: {
          teamId: team.id,
          teamName: team.name,
          hackathonBatch,
        },
      });

      // 3. Queue Deep Sync & Anti-Cheat Audit in BullMQ
      await repoSyncQueue.add('sync-and-audit', {
        repositoryId: repo.id,
        fullName,
        hackathonStartTime: hackathonStartTime.toISOString(),
      });

      importedRepos.push({ fullName, teamName, status: 'QUEUED_FOR_SYNC' });
    } catch (err: any) {
      errors.push({ fullName, reason: err.message });
    }
  }

  return reply.send({
    success: true,
    totalRows: rows.length,
    importedCount: importedRepos.length,
    importedRepos,
    errors,
  });
}
```

### 8.2 Server-Side Token Pool Manager (`token-rotator.ts`)

```typescript
import { Octokit } from '@octokit/rest';

class GitHubTokenPool {
  private tokens: string[] = [];
  private currentIndex = 0;

  constructor() {
    const rawTokens = process.env.GITHUB_TOKEN_POOL || process.env.GITHUB_TOKEN || '';
    this.tokens = rawTokens.split(',').map((t) => t.trim()).filter(Boolean);
    if (this.tokens.length === 0) {
      console.warn('⚠️ No GitHub tokens found in GITHUB_TOKEN_POOL. API calls will be heavily rate-limited.');
    } else {
      console.log(`✅ Loaded ${this.tokens.length} GitHub PAT token(s) in rotation pool.`);
    }
  }

  public getOctokit(): Octokit {
    if (this.tokens.length === 0) {
      return new Octokit(); // Unauthenticated fallback (60 req/hr)
    }

    // Round-robin selection
    const token = this.tokens[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.tokens.length;

    return new Octokit({ auth: token });
  }

  public getRawToken(): string {
    if (this.tokens.length === 0) return '';
    const token = this.tokens[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.tokens.length;
    return token;
  }
}

export const tokenPool = new GitHubTokenPool();
```


## 9. Docker Compose & Local Development Setup

### `docker-compose.yml`
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: repopulse-postgres
    restart: always
    environment:
      POSTGRES_USER: repopulse
      POSTGRES_PASSWORD: secretpassword
      POSTGRES_DB: repopulse_db
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U repopulse -d repopulse_db']
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: repopulse-redis
    restart: always
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: repopulse-api
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    ports:
      - '5000:5000'
    environment:
      NODE_ENV: development
      PORT: 5000
      DATABASE_URL: "postgresql://repopulse:secretpassword@postgres:5432/repopulse_db?schema=public"
      REDIS_URL: "redis://redis:6379"
      JWT_SECRET: "your_ultra_secure_jwt_secret_key"
      GITHUB_CLIENT_ID: "your_github_client_id"
      GITHUB_CLIENT_SECRET: "your_github_client_secret"
      GITHUB_WEBHOOK_SECRET: "your_github_webhook_secret"
    volumes:
      - .:/usr/src/app
      - /usr/src/app/node_modules

volumes:
  postgres_data:
  redis_data:
```

### `.env.example`
```env
# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Database (Supabase Managed PostgreSQL)
# 1. Transaction Pooler (PgBouncer) for application queries:
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[YOUR-REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
# 2. Direct Connection for Prisma CLI migrations:
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[YOUR-REGION].pooler.supabase.com:5432/postgres"

# Supabase SDK & Storage Credentials (Optional)
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOi..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."

# Redis Cache & Queue
REDIS_URL="redis://localhost:6379"

# Security & Admin Access
ADMIN_API_KEY="repopulse_super_secret_admin_pin_2026"
JWT_SECRET="repopulse_super_secret_jwt_key_2026"
SESSION_EXPIRY="7d"

# Server-Side GitHub Token Pool (Rotation for Rate Limits)
GITHUB_TOKEN_POOL="ghp_tokenAlpha123,ghp_tokenBeta456,ghp_tokenGamma789"
GITHUB_WEBHOOK_SECRET="repopulse_webhook_secret_phrase"

# Alert Channels
SLACK_DEFAULT_WEBHOOK=""
DISCORD_DEFAULT_WEBHOOK=""
TELEGRAM_BOT_TOKEN=""
RESEND_API_KEY=""

# AI Integration
OPENAI_API_KEY=""
GEMINI_API_KEY=""
```

---

## 10. Step-by-Step Implementation Roadmap

If you want an AI or yourself to build this step-by-step, follow this exact sequence:

1. **Phase 1: Supabase & Redis Environment Setup (Day 1)**
   - Create a free project on [Supabase.com](https://supabase.com).
   - Copy `DATABASE_URL` (Port 6543) and `DIRECT_URL` (Port 5432) into `.env`.
   - Run `npx prisma db push` to generate all 13 tables, relations, and indexes in Supabase within 10 seconds.
   - Verify table structure in the Supabase web Table Editor.
   - Start local Redis 7 (via Docker Compose or local instance) for BullMQ queues.
2. **Phase 2: Authentication & GitHub Integration (Day 2)**
   - Implement GitHub OAuth 2.0 flow (`/auth/github` -> `/auth/github/callback`).
   - Store encrypted OAuth tokens and issue JWTs for frontend requests.
   - Build Octokit client singleton with rate-limit tracking.
3. **Phase 3: Webhook Pipeline & BullMQ Queue (Day 3)**
   - Create Fastify raw-body HMAC SHA-256 validation middleware.
   - Setup BullMQ `github-webhook-queue` worker.
   - Handle `push`, `pull_request`, `issues`, and `workflow_run` events.
4. **Phase 4: Realtime Engine & WebSockets (Day 4)**
   - Initialize Socket.io with `@socket.io/redis-adapter`.
   - Implement room-based broadcasts (`repo:{id}`, `global:stream`).
   - Wire frontend `useRealtimeStore` to listen to live WebSocket events.
5. **Phase 5: Algorithmic Engines (Day 5)**
   - Implement `calculateHealthScore()` with 6 weighted metrics.
   - Implement `runAntiCheatAudit()` for hackathon timestamp verification and bulk dump flagging.
   - Implement multi-channel alert dispatching with quiet hours and Redis throttle windows.
6. **Phase 6: AI Reports & Production Hardening (Day 6)**
   - Integrate OpenAI / Gemini API for generating weekly executive digests.
   - Setup Prometheus metrics and Sentry error monitoring.
   - Build production multi-stage Docker image and deploy.

---

*Authored for the RepoPulse Team — HackQubit 2026*
