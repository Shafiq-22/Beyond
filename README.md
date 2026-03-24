# Beyond — Fitness PWA

A production-grade Progressive Web App workout tracker — a full fitness app built with React, Tailwind CSS, Zustand, and Supabase.

---

## Features

- **Workout Logger** — log sets (reps, weight, RPE), autofill previous data, PR detection
- **Rest Timer** — countdown with Web Notifications + haptic feedback
- **Exercise Database** — 100+ preloaded exercises + custom exercise creation
- **Routine Builder** — create, edit, delete workout routines
- **History** — full workout log with set details
- **Analytics** — weekly volume chart + strength trends per exercise
- **Offline-First** — works fully offline, syncs when back online
- **PWA** — installable, fast, mobile-first dark UI

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite |
| Styles | Tailwind CSS (dark mode) |
| State | Zustand |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| Offline | Service Workers (vite-plugin-pwa) + IndexedDB (idb) |
| Charts | Recharts |

---

## Setup (Step-by-Step)

### 1. Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A free [Supabase](https://supabase.com) account

### 2. Clone and Install

```bash
git clone https://github.com/shafiq-22/beyond.git
cd beyond
npm install
```

### 3. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) → create a new project
2. **SQL Editor** → run `supabase/schema.sql` (paste entire file, Execute)
3. **SQL Editor** → run `supabase/seed.sql` (loads 100+ exercises)
4. **Project Settings → API** → copy **Project URL** and **anon/public key**

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Run Locally

```bash
npm run dev
# open http://localhost:3000
```

---

## Deployment (Vercel + Supabase)

1. Push to GitHub
2. [vercel.com](https://vercel.com) → New Project → Import repo
3. Add env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
4. Deploy

In Supabase → **Authentication → URL Configuration**:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/**`

---

## Project Structure

```
src/
├── lib/           # Supabase client, IndexedDB, sync, haptics
├── stores/        # Zustand state (auth, workout, exercises, routines)
├── hooks/         # Custom hooks (useWorkout, useAuth, useRestTimer…)
├── components/    # UI primitives, layout, workout logger components
└── pages/         # Route pages
supabase/
├── schema.sql     # Full DB schema + RLS policies
└── seed.sql       # 100+ preloaded exercises
```

---

## Performance

- Set logging < 1s — local state in SetRow, flush to store on blur
- No unnecessary re-renders — `React.memo` on SetRow + ExerciseCard
- Instant cold load — IndexedDB cache, Supabase syncs in background
- Code splitting — pages lazy-loaded with `React.lazy`

---

## Offline Support

All writes while offline are enqueued in IndexedDB (`sync_queue`).
On reconnect, `processSyncQueue()` flushes them to Supabase automatically.
