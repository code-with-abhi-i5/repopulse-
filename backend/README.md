# 🚀 RepoPulse Backend Engine (Node.js + Supabase + WebSockets)

Production-grade backend for **RepoPulse** — Real-time GitHub Intelligence, Hackathon Anti-Cheat & Code Freshness Verification.

---

## ⚡ Quick Start

### 1. Configure Supabase in `backend/.env`
Open [backend/.env](file:///c:/Users/ghosh/OneDrive/Desktop/github%20hackqubit/backend/.env) and update with your Supabase credentials:

```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
ADMIN_API_KEY="hackqubit-admin-secret-2026"
```

### 2. Auto-Deploy All Tables to Supabase (10 Seconds)
```bash
npm run backend:push
```
*Creates all 13 PostgreSQL tables, relations, and indexes in Supabase automatically.*

### 3. Run the Backend Server
From the root directory:
```bash
npm run backend
```
Or from inside the `backend` folder:
```bash
npm run dev
```

The server will be live at:
* **HTTP API:** `http://localhost:5000/api/v1`
* **WebSocket Server:** `ws://localhost:5000`
* **Health Check:** `http://localhost:5000/api/v1/health`

---

## 📂 Key Architecture Modules

* [schema.prisma](file:///c:/Users/ghosh/OneDrive/Desktop/github%20hackqubit/backend/prisma/schema.prisma) — Supabase PostgreSQL schema with dual connection pooling (`DATABASE_URL` + `DIRECT_URL`).
* [src/services/anticheat.service.ts](file:///c:/Users/ghosh/OneDrive/Desktop/github%20hackqubit/backend/src/services/anticheat.service.ts) — Freshness verification against hackathon start time + bulk dump detection.
* [src/services/health.service.ts](file:///c:/Users/ghosh/OneDrive/Desktop/github%20hackqubit/backend/src/services/health.service.ts) — 6-pillar dynamic health scoring engine (0–100).
* [src/services/excel.service.ts](file:///c:/Users/ghosh/OneDrive/Desktop/github%20hackqubit/backend/src/services/excel.service.ts) — Multi-format `.xlsx` / `.csv` bulk repository URL parser.
* [src/services/github.service.ts](file:///c:/Users/ghosh/OneDrive/Desktop/github%20hackqubit/backend/src/services/github.service.ts) — Octokit REST & GraphQL crawler for public repositories.
* [src/lib/token-pool.ts](file:///c:/Users/ghosh/OneDrive/Desktop/github%20hackqubit/backend/src/lib/token-pool.ts) — Server-side GitHub token pool with round-robin rotation.
* [src/lib/socket.ts](file:///c:/Users/ghosh/OneDrive/Desktop/github%20hackqubit/backend/src/lib/socket.ts) — Real-time event broadcasting (`activity:new`, `health:updated`, `anticheat:status`).
* [src/services/alert.service.ts](file:///c:/Users/ghosh/OneDrive/Desktop/github%20hackqubit/backend/src/services/alert.service.ts) — Multi-channel notifications for Slack, Discord, and Telegram with throttling.

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Health check probe | Public |
| `GET` | `/api/v1/repositories` | Filterable repository list | Public |
| `GET` | `/api/v1/repositories/:id` | Single repository deep details | Public |
| `GET` | `/api/v1/repositories/:id/health`| 6-pillar health breakdown | Public |
| `POST`| `/api/v1/repositories/:id/anti-cheat-audit` | Run freshness audit against start time | Public |
| `POST`| `/api/v1/repositories/upload-excel` | Upload `.xlsx` / `.csv` file | `x-admin-key` |
| `POST`| `/api/v1/repositories/bulk-add` | Paste JSON array of repo links | `x-admin-key` |
| `GET` | `/api/v1/activities` | Chronological activity feed | Public |
| `GET` | `/api/v1/contributors` | Contributor rankings & streaks | Public |
| `GET` | `/api/v1/pull-requests` | PR list with latency stats | Public |
| `GET` | `/api/v1/issues` | Issues list with SLA response | Public |
| `GET` | `/api/v1/alerts` | Triggered alerts list | Public |
| `POST`| `/api/v1/webhooks/github` | Ingest live GitHub Webhooks | HMAC SHA256 |
