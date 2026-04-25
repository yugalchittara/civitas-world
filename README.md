# Civitas World Demo

This repository is a standalone, demo-safe public export of the World-facing Civitas experience.

## What lives here

- MiniKit wallet sign-in flow
- World ID proof verification flow
- A lightweight verification status page
- Minimal shared UI needed for the demo

## What does not live here

- Private Civitas backend modules
- Admin or moderation tooling
- Production database schema or migrations
- Internal scoring, trust pipeline, or private incident flows
- Real secrets or production env files

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the example environment:

```bash
cp .env.example .env.local
```

3. Fill in the required World variables:

- `NEXT_PUBLIC_WORLD_APP_ID`
- `WORLD_APP_ID`
- `WORLD_RP_ID`
- `WORLD_SIGNING_KEY`
- `NEXTAUTH_SECRET`

4. Start the app:

```bash
npm run dev
```

The demo runs on `http://localhost:3002`.

## Routes

- `/` - public demo landing page
- `/mini` - MiniKit wallet sign-in demo
- `/reporter-verification` - World ID verification demo

## Secrets safety

Before publishing, run:

```bash
npm run check:secrets
```

The scan looks for:

- `key`
- `secret`
- `token`
- `password`
- `private`
- `signing`
- `DATABASE_URL`
- `NEXT_PUBLIC`
- `WORLD`
- `SUPABASE`

## Sync model

This repo is intentionally one-way exported from the private Civitas repository. Refresh the public repo only from allowlisted paths in `export-manifest.json`.
