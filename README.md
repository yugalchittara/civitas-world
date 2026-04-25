# Civitas — Trust Check for Verified Humans

> Before you trust, check the pattern.

Civitas is a **trust and verification layer** that turns real-world interactions into structured, evidence-backed signals — helping people (and agents) make better decisions before money, work, or reputation is on the line.

---

## 🧠 The Problem

Across hiring, lending, freelance work, and collaborations, the same failure repeats:

- Payments get delayed  
- Commitments break  
- Communication disappears  

But before every decision, everything looks fine:
- profiles  
- resumes  
- references  

Because **behavior is invisible**.

This creates three systemic gaps:

- **Trust without institutions** → no portable reputation  
- **Verification without managers** → no reliable version of truth  
- **Disputes without courts** → no structured path to resolution  

---

## 🚀 The Solution

Civitas creates **structured, verifiable trust signals** from real interactions.

Instead of opinions or ratings, Civitas captures:

- what was expected  
- what actually happened  
- evidence and context  
- responses from both sides  
- corroborations over time  

These inputs become **pattern-based signals** that help others make informed decisions.

---

## 🔍 Core Features

### 1. Trust Check
Search a person or entity to see a structured view of behavior:


---

### 2. Record Interaction
Log a structured record of what happened:

- Relationship context (lending, hiring, freelance, etc.)
- Expected vs actual outcome  
- Timeline  
- Evidence (documents, messages, links)  

---

### 3. Response Layer
The other party can:
- acknowledge  
- dispute  
- clarify  
- resolve  

Creating a **bidirectional record of truth**

---

### 4. Pattern Detection
A single incident doesn’t define trust.

Repeated behavior across records becomes a **signal**.

> People don’t fail once. They repeat.

---

## 🌐 World Integration

Civitas is built as a **World Mini App**, extending identity into trust.

- **World ID (staging/simulator)** → proves user is human  
- **Wallet Auth** → identity-linked interaction  
- **Civitas** → behavioral trust layer  

> World proves who you are.  
> Civitas helps determine whether you should trust them.

---

## 🤖 Agent Extension

The same system applies beyond humans.

As AI agents begin acting and transacting independently, trust shifts from identity to execution.

Civitas enables:

- Execution reliability tracking  
- Intent alignment verification  
- Failure and correction history  
- Accountability over time  

---

## 🔧 Tech Stack

- Next.js / React  
- World MiniKit  
- World ID (IDKit — staging mode for demo)  
- Node / API routes  
- Mocked data layer for hackathon demo  

---

## What lives here

- MiniKit wallet sign-in flow
- World ID proof verification flow
- A lightweight verification status page
- Minimal shared UI needed for the demo

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
