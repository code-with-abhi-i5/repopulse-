# ⚡ RepoPulse — GitHub Repository Intelligence & Team Telemetry Engine

<div align="center">

![RepoPulse Banner](https://img.shields.io/badge/RepoPulse-Mission%20Control-indigo?style=for-the-badge&logo=github)
![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript%205-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Supabase%20Postgres-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Upstash Redis](https://img.shields.io/badge/Upstash%20Redis-00E599?style=for-the-badge&logo=redis&logoColor=white)

**An enterprise-grade, real-time GitHub repository intelligence, team telemetry, and mission-control cockpit designed for hackathons, engineering teams, and open-source organizations.**

[Complete Features Documentation (PROJECT_FEATURES.md)](./PROJECT_FEATURES.md) • [Backend System Design](./BACKEND_SYSTEM_DESIGN.md)

</div>

---

## 🌟 Highlights & Capabilities

- 🏢 **Multi-Repo Team Management:** Track teams managing multiple repositories (e.g. Frontend + Backend) with combined commits, average health scores, and side-by-side subgrid inspect cards.
- ⚡ **Autonomous Telemetry Poller:** Background worker engine polling GitHub repositories every 45 seconds for commits, branches, PRs, and issues.
- 🔑 **GitHub Token Rotation Pool:** Distributes requests across multiple Personal Access Tokens (PATs) to scale rate limits to 10,000+ req/hr.
- 🚀 **Serverless Cloud Caching:** Upstash Redis Cloud REST cache providing sub-50ms API queries with zero-downtime PostgreSQL fallback.
- 📊 **Dynamic Pulse Health Score (0-100):** Algorithmic scoring based on commit frequency, PR latency, issue resolution, and branch maintenance.
- 👥 **Cross-Repo Contributor Leaderboard:** Tracks developer commits, additions/deletions, streaks, and multi-repo contributions.
- 📁 **Instant Bulk & Excel Ingestion:** Drag-and-drop `.xlsx`/`.csv` or paste rows directly from Google Sheets to register 50+ teams in seconds.
- 📡 **Real-Time WebSocket Streams:** Socket.io live event streams with scoped rooms for teams (`team:${id}`) and repos (`repo:${id}`).
- 🔍 **Side-by-Side Repo Comparison:** Live visual diff comparing metrics, code churn, and velocity between any two repositories.
- 🔔 **Multi-Channel Alert Engine:** Automated alerts with Discord, Slack, and in-app notifications.
- 📑 **Executive Performance Reports:** Instant exportable performance reports and summaries.

---

## 🏗️ Architecture Overview

```
┌───────────────────────────────────────────────────────────┐
│                 RepoPulse React 19 Frontend               │
│  (TailwindCSS v4, Three.js 3D Canvas, Recharts, Zustand)  │
└───────────────▲───────────────────────────▲───────────────┘
                │ REST API (/api/v1)        │ WebSockets (Socket.io)
┌───────────────▼───────────────────────────▼───────────────┐
│                 Node.js Express Backend Engine            │
│       (TypeScript ESM, Autonomous Poller, Token Pool)     │
└───────────────┬───────────────────────────┬───────────────┘
                │                           │
    ┌───────────▼───────────┐   ┌───────────▼───────────┐
    │  Upstash Redis Cloud  │   │  Supabase PostgreSQL  │
    │  (Sub-50ms REST API)  │   │    (Prisma ORM v6)    │
    └───────────────────────┘   └───────────────────────┘
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 18+ (Node 20 or 22 recommended)
- Git

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
*Backend runs on `http://localhost:5000` with WebSocket server on port 5000.*

### 3. Frontend Setup
```bash
# In the repository root
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

### 4. Health & Infrastructure Verification
```bash
cd backend
npm run test:upstash   # Verify Upstash Redis Cloud connection & latency
npm run test:tokens    # Verify GitHub Token Pool & rate-limit capacity
```

---

## 📖 Complete Documentation

For detailed information on all 11 core systems, application sitemap, and complete API endpoint specifications, check **[PROJECT_FEATURES.md](./PROJECT_FEATURES.md)**.

---

*Built with ❤️ for hackathons, engineering leaders, and modern development teams.*
