# Quill - Smart Content Assistant

> AI-powered content transformation. Paste any text, get a summary, rewrite, or bullet points instantly.

## Live Demo

[Link placeholder - will be added after deployment]

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 16.2 (App Router) | API routes + SSR in one repo, proxy.ts for auth |
| Language | TypeScript (strict) | Zero `any` types, full type safety |
| Database + Auth | Supabase | PostgreSQL + RLS + OAuth built-in |
| AI | Anthropic Claude (claude-haiku-4-5) | Fast, cost-efficient for content tasks |
| Styling | Tailwind v4 + shadcn/ui | CSS variables for design system, no hardcoded colors |
| Rate Limiting | Upstash Redis | Serverless-native sliding window |
| Share IDs | nanoid | Non-guessable, URL-safe, shorter than UUID |
| Validation | Zod v4 | Schema validation on all API inputs |
| Fonts | Plus Jakarta Sans + Geist Mono | UI + AI output distinction |
| Deployment | Vercel | Native Next.js support |

## Features

### Core

- **AI Content Generation** - Summary, professional rewrite, casual rewrite, and key bullet points powered by Claude
- **Authentication** - Email/password signup and login + Google OAuth via Supabase
- **User History** - All generations saved per user, browsable in the sidebar, grouped by date
- **Shareable Links** - Every result can be shared via a unique public URL (read-only, no login required)

### Bonus

- **Rate Limiting** - 10 generations per minute per user via Upstash sliding window
- **Expiring Links** - Share links can expire in 1 hour, 24 hours, or 7 days
- **Public/Private Toggle** - Shared links can be disabled at any time
- **Account Deletion** - Full account + data deletion with CASCADE cleanup
- **Dark Mode** - Full light/dark theme with system preference detection

## Getting Started

### Prerequisites

- Node.js 20.9.0 or higher
- A Supabase project
- An Anthropic API key
- An Upstash Redis database

### 1. Clone and install

```bash
git clone [repo-url]
cd quill
npm install
```

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database setup

Run the migration in your Supabase SQL editor:

```
supabase/migrations/001_schema.sql
```

Or via CLI:

```bash
supabase link
supabase db push
```

### 4. Run locally

```bash
npm run dev
```

The app runs at http://localhost:3000

Note: The dev script includes `NODE_OPTIONS=--max-http-header-size=32768` to support Supabase OAuth cookie size requirements.

### 5. Google OAuth (optional)

In Google Cloud Console:
- Create OAuth credentials (Web application type)
- Add your Supabase project callback URL as an authorized redirect URI: `https://[your-project-ref].supabase.co/auth/v1/callback`

In Supabase dashboard:
- Authentication > Providers > Google
- Paste your Client ID and Client Secret

## Architecture Decisions

### Supabase RLS over middleware-only auth

Row Level Security enforces data access at the database level. Even if an API route had a bug, a user cannot read another user's generations. The assignment specifically requires "APIs should enforce access control (not just the frontend)". RLS satisfies this at the deepest level.

### proxy.ts instead of middleware.ts

Next.js 16 replaced middleware.ts with proxy.ts. The auth guard runs on every request, refreshes session cookies, and redirects unauthenticated users, all without duplicating logic in layouts.

### Cursor-based pagination over offset

History uses `created_at DESC` as a cursor. Offset pagination breaks when new items are inserted during a session (items shift position). Cursor pagination is stable regardless of concurrent writes.

### nanoid(12) for share IDs

UUID is 36 characters. nanoid(12) gives roughly 4 billion combinations at this scale with URL-safe characters. Shorter URLs, same practical collision resistance for a single-tenant SaaS.

### Single useHistory instance via DashboardContext

Early implementation called useHistory in both DashboardShell (for sidebar) and the dashboard page separately. This caused the sidebar to not update when new generations were created. Lifting state into DashboardContext gives a single source of truth: one fetch, one update, shared everywhere.

### No global state library

React Context + custom hooks cover all state needs. Adding Zustand or Redux would be architectural overhead with zero benefit at this scale.

### Thin API routes

All business logic lives in `lib/`. Routes do exactly three things: validate input, call a lib function, return a response. This makes routes testable and keeps them readable at a glance.

## Trade-offs

### What was prioritized

- **Correctness over cleverness** - Straightforward patterns that are easy to follow and reason about
- **Security depth** - RLS + server-side auth guards + Zod validation at every layer
- **Feature completeness** - All core and bonus features implemented and working

### What would change in production

- **Streaming AI responses** - Currently collecting full response before returning. Streaming would improve perceived performance for long outputs.
- **Background jobs** - Heavy generation could be offloaded to a queue rather than blocking the HTTP request.
- **Dedicated share endpoint** - SharedSheet currently fetches full history and filters client-side; a dedicated filtered endpoint would be more efficient at scale.
- **Error monitoring** - Sentry or similar for production error tracking.

## Bonus Features Implemented

| Feature | Location |
|---|---|
| Rate limiting (10 req/min) | `lib/rate-limit.ts` + `app/api/generate/route.ts` |
| Expiring share links | `components/share/ShareDialog.tsx` + `app/api/share/[id]/route.ts` |
| Public/private toggle | `components/share/ShareDialog.tsx` |
| Account deletion with cascade | `app/api/account/route.ts` + `supabase/migrations/001_schema.sql` |
| Dark mode | `app/globals.css` + `components/layout/ThemeToggle.tsx` |
| Shared links manager | `components/share/SharedSheet.tsx` |
