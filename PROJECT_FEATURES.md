# ⚡ RepoPulse — Complete Project Features & System Architecture

> **RepoPulse** is an enterprise-grade, real-time GitHub repository intelligence, team telemetry, and mission-control platform designed for hackathons, engineering teams, and open-source organizations.

---

## 📌 Executive Summary

RepoPulse bridges the gap between raw Git commits and actionable engineering intelligence. Whether evaluating 50+ hackathon teams simultaneously or monitoring an organization's microservices, RepoPulse aggregates commits, pull requests, issues, contributor velocity, and repository health in real time — with zero manual status check-ins.

---

## 🏗️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | **React 19**, **TypeScript**, **Vite 8** |
| **Styling & Design** | **TailwindCSS v4**, Custom Cyber-Dark Glassmorphic UI (`#050914`), Radix UI primitives |
| **Visuals & 3D** | **Three.js** (interactive 3D particle canvas), **GSAP**, **Framer Motion** |
| **Charts & Data Viz** | **Recharts** (velocity curves, latency bar charts, radar breakdown, donut charts) |
| **Client State** | **Zustand** (modular stores: UI, Auth, Realtime, Notifications, Demo) |
| **Backend Runtime** | **Node.js (ESM)**, **Express 4**, **TypeScript 5**, `tsx` |
| **Primary Database** | **Supabase PostgreSQL** via **Prisma ORM v6** (with PgBouncer connection pooling) |
| **Cloud Caching** | **Upstash Redis** (Serverless REST API, sub-50ms queries, zero-downtime in-memory fallback) |
| **Real-Time Engine** | **Socket.io** WebSockets with team & repo scoped rooms |
| **GitHub Ingestion** | **Octokit REST & GraphQL**, Multi-PAT Token Rotation Pool |
| **Cloud Hosting** | **Render** (via Render MCP Server), **Vercel** / **Netlify** ready |

---

## 📑 Table of Contents (Direct Jump)

1. [🏢 Multi-Repo Team Management](#1--multi-repo-team-management)
2. [⚡ Live GitHub Scraper & Automated Telemetry Poller](#2--live-github-scraper--automated-telemetry-poller)
3. [🚀 Serverless Cloud Caching (Upstash Redis)](#3--serverless-cloud-caching-upstash-redis)
4. [📊 360° Repository Pulse Score (Health Engine)](#4--360-repository-pulse-score-health-engine)
5. [👥 Contributor Leaderboards & Multi-Repo Rollup](#5--contributor-leaderboards--multi-repo-rollup)
6. [📁 Bulk Ingestion & Hackathon Spreadsheets](#6--bulk-ingestion--hackathon-spreadsheets)
7. [📡 Real-Time Live Activity Stream & WebSockets (Deep Dive)](#7--real-time-live-activity-stream--websockets-deep-dive)
8. [🔍 Side-by-Side Repository Comparison](#8--side-by-side-repository-comparison)
9. [🔔 Intelligent Multi-Channel Alert Engine](#9--intelligent-multi-channel-alert-engine)
10. [📑 Executive Reports & Intelligence Summaries](#10--executive-reports--intelligence-summaries)
11. [🔐 Security & Access Control](#11--security--access-control)
12. [🗺️ Application Sitemap & Page Routes](#-application-sitemap--pages)
13. [🔌 Complete API Endpoints Reference](#-api-endpoints-reference)

---

## 🌟 Core Features Breakdown

### 1. 🏢 Multi-Repo Team Management
In modern hackathons and real-world projects, a single team frequently develops **2 or more repositories** (e.g. `team-frontend` in React/Next.js and `team-backend` in Node.js/Python).

- **"By Team" View Toggle:** On the Repositories page, switch seamlessly between **Grid View**, **Table View**, and **By Team View**.
- **Aggregated Team Cards:** Displays all repositories belonging to a team under a unified master card:
  - **Multi-Repo Badge:** Highlights `Multi-Repo Team (2 Repos)`.
  - **Combined Commits:** Automatically sums commits across frontend, backend, and microservices.
  - **Average Pulse Health:** Calculates the team's combined repository health score.
  - **Combined Stars & Forks:** Tracks total community engagement.
- **Side-by-Side Repo Subgrid:** Shows both repositories side-by-side with individual languages, commit counts, health scores, and direct inspection links.
- **Dedicated API Endpoint:** `GET /api/v1/teams` returns all teams with their nested repositories and rolled-up telemetry.

---

### 2. ⚡ Live GitHub Scraper & Automated Telemetry Poller
- **Automated Polling Cron:** An autonomous background worker runs every 45 seconds, polling tracked GitHub repositories for new commits, branch pushes, pull requests, and issues.
- **GitHub Token Rotation Pool:** Built-in multi-token rotation (`token-pool.ts`) that distributes scraping requests across multiple GitHub Personal Access Tokens (PATs).
  - Multiplies GitHub API limits from 5,000 req/hr to 10,000+ req/hr.
  - Prevents rate-limit exhaustion during high-volume hackathons.
- **GitHub Webhook Ingestion:** `POST /api/v1/webhooks/github` accepts real-time GitHub webhook events with HMAC signature verification for instant sub-second event broadcasts.

---

### 3. 🚀 Serverless Cloud Caching (Upstash Redis)
- **High-Speed Caching Layer:** Caches expensive repository lists, team aggregations, contributor stats, and analytics in Upstash Redis Cloud via REST API.
- **Zero-Downtime Fallback:** Built with timeout bounds (3000ms). If Upstash or network degrades, the backend automatically and seamlessly serves requests from Supabase PostgreSQL + in-memory LRU cache without any downtime or client freeze.
- **Smart Cache Invalidation:** Automatically invalidates cached repository and team keys when new commits arrive, Excel sheets are uploaded, or sync jobs complete.
- **Observability Endpoint:** `GET /api/v1/health` provides real-time latency, hit/miss metrics, and Redis provider status.

---

### 4. 📊 360° Repository Pulse Score (Health Engine)
Every repository is dynamically evaluated with an automated **Pulse Health Score (0 to 100)**:
- **Commit Frequency & Recency:** Rewards active development and consistent push cadence.
- **PR Latency & Merge Efficiency:** Measures how quickly pull requests are reviewed and merged.
- **Issue Resolution Velocity:** Tracks open vs closed issues and triage responsiveness.
- **Branch Cleanliness & Documentation:** Verifies default branch hygiene and project setup.
- **Visual Health Badges:**
  - 🟢 **90-100 (Optimal Pulse):** Emerald badge.
  - 🔵 **75-89 (Healthy Pulse):** Cyan badge.
  - 🟡 **Below 75 (Needs Attention):** Amber badge.

---

### 5. 👥 Contributor Leaderboards & Multi-Repo Rollup
- **Individual Developer Tracking:** Profiles every developer by commits, lines of code added, lines deleted, and active push streaks.
- **Cross-Repo Contributor Detection:** If a developer pushes code to both the Frontend repo and Backend repo of their team, RepoPulse automatically tracks their contributions across both repositories under a single contributor profile.
- **Streak & Activity Badges:** Visualizes daily commit streaks, longest streaks, and bot filtering.

---

### 6. 📁 Bulk Ingestion & Hackathon Spreadsheets
Register dozens of repositories and teams in seconds via three flexible methods:
1. **Excel / CSV Drag & Drop:** Upload `.xlsx`, `.xls`, or `.csv` files. Automatically maps columns like `Team Name`, `Repository URL`, and `Batch`.
2. **Bulk Text & Spreadsheet Paste:** Paste hundreds of rows copied directly from Google Sheets or CSVs (supports comma `,`, pipe `|`, or tab `\t`).
3. **Interactive Row Builder:** Add and edit repository rows interactively in the UI.
4. **Duplicate Prevention:** Safe `upsert` logic ensures existing teams and repositories are updated without corrupting relations.

---

### 7. 📡 Real-Time Live Activity Stream & WebSockets (Deep Dive)

RepoPulse features an end-to-end **Real-Time Telemetry Streaming Engine** powered by Socket.io WebSockets (`/activity` page and global header notification bell):

#### A. Architecture & Connection Lifecycle
- **Zero-Polling Real-Time Protocol:** Browser establishes a persistent WebSocket connection to `http://localhost:5000` on initial load (`useRealtimeSocket.ts`).
- **Live Status Indicator:** Header and Activity Page feature a live glowing emerald badge: `⚡ LIVE TELEMETRY STREAM` when connected.
- **Graceful Reconnection & Fallback:** If internet cuts or server restarts, socket attempts auto-reconnection every 3 seconds (3 attempts) and switches UI to historical cached state without throwing errors.

#### B. WebSocket Scoped Rooms
- **Global Fleet Broadcast:** Pushes all public commits and events across every participating team.
- **Repository-Scoped Room (`repo:${repositoryId}`):** Clients viewing a specific repository subscribe to isolated real-time events for that project.
- **Team-Scoped Room (`team:${teamId}`):** Team members and mentors receive real-time updates whenever code is pushed to *any* repository belonging to their team (frontend + backend).

#### C. Real-Time Event Types Tracked
Every event is color-coded with customized icons and metadata tags:
1. **Push Events (`GitCommit` - Blue):** Commit count, author avatar, branch name (`main`, `dev`), additions (`++`) and deletions (`--`).
2. **Pull Request Events (`GitPullRequest` - Purple):** PR created, review submitted, PR merged, draft status.
3. **Issue Events (`AlertCircle` - Amber):** New bugs, feature requests, issue closed.
4. **CI/CD Workflow Runs (`Activity` - Rose):** GitHub Actions build passing/failing status.
5. **Release Events (`Tag` - Emerald):** New version tags and releases.
6. **Star / Fork Bursts (`Star` / `GitFork` - Yellow / Cyan):** Community engagement milestones.

#### D. Interactive Live Activity Cockpit (`/activity` Page Features)
- **Live Play / Pause Ingestion Toggle:** Organizers can freeze the stream (`Pause Live Feed`) to scrutinize an incoming burst of commits, then resume (`Play`) without losing historical data.
- **Real-Time Telemetry Stats Marquee:**
  - Total Pushes Recorded.
  - Live Lines of Code Added (`++`) vs Deleted (`--`).
  - Currently Active Teams counter.
- **Multi-Dimensional Stream Filters:**
  - Filter by Event Type (Pushes only, PRs only, Workflows only).
  - Filter by Target Repository.
  - Filter by Participating Team Name.
  - Real-time text search through commit messages, SHAs, and author handles.
- **Interactive Event Cards:** Each card provides one-click direct navigation to the commit on GitHub (`ExternalLink`) or internal repository deep-dive (`/repositories/:owner/:repo`).
- **Dynamic In-App Notification Toasts:** Incoming `activity:new` socket events automatically trigger rich notification toasts with actor avatar and commit snippet.

---

### 8. 🔍 Side-by-Side Repository Comparison
- Select any two repositories to open an instant side-by-side comparison modal.
- Directly compare:
  - Pulse Health Scores
  - Total Commits & Push Frequency
  - Star & Fork engagement
  - Code additions vs deletions
  - Open Issues & PR turnaround

---

### 9. 🔔 Intelligent Multi-Channel Alert Engine
- **Custom Rule Engine:** Create customized alert rules based on trigger conditions (e.g. commit bursts, health score drop, stale issues).
- **Severity Levels:** `INFO`, `WARNING`, `CRITICAL`.
- **Multi-Channel Integrations:**
  - In-app notification drawer with unread counters.
  - Discord Webhooks.
  - Slack Webhooks.
  - Telegram Bot alerts.

---

### 10. 📑 Executive Reports & Intelligence Summaries
- **Automated Report Generation:** Generate periodic executive reports (Daily, Weekly, Hackathon Finale).
- **Key Fleet Highlights:** Summarizes total active repositories, total teams, fleet-wide commits, merged PRs, and top contributors.
- **Monitored Fleet Breakdown Table:** Clean tabular breakdown of top performing projects.

---

### 11. 🔐 Security & Access Control
- **Role-Based Access Control (RBAC):** Supports `ADMIN`, `ORGANIZER`, `TEAM_LEAD`, `DEVELOPER`, and `JUDGE`.
- **Master Admin Key Protection:** Destructive actions (deleting repositories, bulk Excel imports, system-level syncs) are strictly protected by `x-admin-key` header verification.
- **Credentials Protection:** Strict `.gitignore` configurations ensure environment variables (`.env`), database connection strings, and GitHub PATs are never committed to version control.

---

## 🗺️ Application Sitemap & Pages

| Route | Page | Purpose |
| :--- | :--- | :--- |
| `/` | **Landing Page** | 3D visual showcase, feature highlights, real-time stats marquee |
| `/login` | **Login & Auth** | Role-based authentication, admin PIN entry, session storage |
| `/dashboard` | **Mission Control** | Fleet-wide KPI metrics, commit velocity chart, recent live events |
| `/repositories` | **Repositories** | Grid view, Table view, "By Team" multi-repo view, bulk import modal |
| `/repositories/:owner/:repo` | **Repo Details** | Deep dive into commit logs, PRs, issues, health radar, and metrics |
| `/activity` | **Live Activity** | Real-time terminal stream of all GitHub events across the fleet |
| `/contributors` | **Contributors** | Developer leaderboards, streaks, additions/deletions, cross-repo tracking |
| `/pull-requests` | **Pull Requests** | PR pipeline (Open, Merged, Closed), review latency metrics |
| `/issues` | **Issues Triage** | Bug and issue triage, resolution times, stale issue flags |
| `/analytics` | **Analytics** | Language distribution, code churn, team velocity graphs |
| `/alerts` | **Alerts Center** | Alert rule builder, notification history, webhook channel settings |
| `/reports` | **Reports** | Executive telemetry summaries, fleet rankings, print-ready reports |
| `/settings` | **Settings** | Theme switcher (Dark/Light), token pool status, API configuration |

---

## 🔌 API Endpoints Reference

### Repositories & Teams
- `GET /api/v1/repositories` — List repositories with pagination, search, language filter, and sorting.
- `GET /api/v1/repositories/:id` — Get detailed repository telemetry and recent commits/PRs/issues.
- `GET /api/v1/repositories/:id/health` — Get granular health score breakdown.
- `GET /api/v1/teams` — Fetch all teams with multi-repo groupings and aggregated metrics.
- `POST /api/v1/repositories/upload-excel` — Bulk import teams and repos from `.xlsx`/`.csv` *(Admin protected)*.
- `POST /api/v1/repositories/bulk-add` — Bulk import teams and repos from JSON array *(Admin protected)*.
- `POST /api/v1/repositories/sync` — Queue immediate deep sync for a repository.
- `DELETE /api/v1/repositories/:id` — Delete a repository *(Admin protected)*.

### Observability & Infrastructure
- `GET /api/v1/health` — Server health, platform version, Upstash Redis latency, and hit/miss statistics.
- `POST /api/v1/webhooks/github` — Ingest real-time GitHub webhook notifications.

### Contributors, Activity & Analytics
- `GET /api/v1/activities` — Stream recent GitHub activity events.
- `GET /api/v1/contributors` — Contributor leaderboard with multi-repo commit rollups.
- `GET /api/v1/pull-requests` — Fleet-wide pull requests with latency analytics.
- `GET /api/v1/issues` — Fleet-wide issues with stale indicators.
- `GET /api/v1/analytics` — Code churn, language breakdown, and velocity metrics.
- `GET /api/v1/reports` — Executive report logs.
- `POST /api/v1/reports/generate` — Generate a new executive report.

---

## 🛠️ How To Run Locally

### 1. Start the Backend Engine
```bash
cd backend
npm install
npm run dev
```
*Backend runs live at `http://localhost:5000` with WebSocket on port 5000.*

### 2. Start the Frontend
```bash
# In project root
npm install
npm run dev
```
*Frontend runs live at `http://localhost:5173` with instant Hot Module Replacement.*

### 3. Verify Health & Upstash Caching
```bash
# Test Upstash Redis Cloud
cd backend
npm run test:upstash

# Test GitHub Token Rotation Pool
npm run test:tokens
```

---

*Authored for RepoPulse — Built with ❤️ for hackathons, engineering leaders, and open-source teams.*
