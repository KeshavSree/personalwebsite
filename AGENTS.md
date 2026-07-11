# AGENTS.md

This file provides guidance to coding agents working in this repository.

## Overview

Personal portfolio website for Keshav Sreekantham built with Next.js (App Router), React 19,
TypeScript, and Tailwind CSS 4, with Framer Motion animation and a hand-authored mosaic visual
motif. It is a **static site** — no backend, no API routes, no database, and no environment
variables required. Hosted on Vercel.

Live site: https://www.keshavsreekantham.com

> History: this repo previously had a RAG chatbot (OpenAI/NVIDIA NIM + Pinecone, a `python-rag/`
> indexer, and an `/api/chat` route). It was **fully removed on 2026-07-10** — the home page is now
> a static hero. Any lingering references to chat / RAG / Pinecone / `python-rag` in old design
> docs or git history are obsolete.

## Project Structure

```
personalwebsite/                     # the Next.js app — run npm commands from here
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Home (server): fetches GitHub contrib history, renders HomeChatClient
│   │   ├── HomeChatClient.tsx       # Home hero (client): mosaic + headline + nav + socials + GitHub calendar
│   │   ├── about/                   # About page
│   │   ├── projects/                # Projects showcase (Framer Motion)
│   │   ├── work/                    # Work timeline
│   │   ├── involvement/             # Involvement page
│   │   ├── components/              # Shared components (see below)
│   │   ├── layout.tsx               # Root layout, metadata, ConditionalChrome
│   │   ├── opengraph-image.tsx      # Static OG image (og-brand.tsx holds OG colors/frame)
│   │   └── globals.css
│   ├── utils/
│   │   ├── jobUtils.ts              # Parses work-experience YAML → JobEntry (work timeline)
│   │   └── involvementUtils.ts      # Parses involvement YAML → InvolvementEntry
│   └── data/
│       ├── projects.json            # Project content
│       └── projectsData.ts          # Typed project catalog (reads projects.json)
└── rag-docs/                        # Source-of-truth YAML (legacy folder name)
    ├── keshav_sreekantham_truth.yaml  # name / education / experience / projects (jobUtils reads experience)
    └── involvement.yaml               # involvement entries (involvementUtils)
```

Components in `src/app/components/`: `mosaic.tsx` (the signature mosaic motif), `navbar.tsx`,
`ConditionalChrome.tsx` (chrome wrapper), `MosaicFrame.tsx` (interior-page frame), `HashScroller.tsx`.

## Development Commands

Run from the `personalwebsite/` directory:
- **Development**: `npm run dev` (http://localhost:3000)
- **Build**: `npm run build`
- **Production**: `npm start`
- **Lint**: `npm run lint`

No Python, no `.env`. (The GitHub contribution calendar fetches a public API at request/build time.)

## Architecture & Key Patterns

### Home page
`src/app/page.tsx` (server component) fetches the full GitHub contribution history (daily-cached)
and passes it to `HomeChatClient.tsx` (client). The hero renders: the mosaic background, the
question-style headline "Who is Keshav Sreekantham?", section nav links (Work / Projects /
Involvement / About), social + contact + resume buttons, and a rotated vertical GitHub
contribution calendar (`VerticalHistoryCalendar`, built on `react-activity-calendar`). The
filename `HomeChatClient` is historical — the home page is no longer a chatbot.

### Chrome (navbar + mosaic frame)
`layout.tsx` wraps every page in `ConditionalChrome`, which renders the global `Navbar` on all
pages **except** the home page (the hero carries its own section nav) and the `InteriorMosaicFrame`
on interior pages.

### Work timeline
Single source of truth: `rag-docs/keshav_sreekantham_truth.yaml`. `jobUtils.ts` parses the
`experience` entries into `JobEntry` objects for the timeline. Path resolution tries
`process.cwd()/rag-docs`, then `__dirname`, then `../rag-docs`.

### Involvement
`rag-docs/involvement.yaml` → `involvementUtils.ts` → `InvolvementEntry`, rendered by the
involvement page.

### Projects
`src/data/projects.json` → `projectsData.ts` (typed catalog) → the projects page, animated with
Framer Motion.

### Styling
Tailwind CSS 4 with PostCSS (`@tailwindcss/postcss`). Framer Motion for animation. The
hand-authored mosaic (`components/mosaic.tsx`) is the signature visual, used on the home hero and
interior page frames. Path alias: `@/*` → `./src/*`.

## Data / content constraints
- **Work YAML** experience entries require `role`, `company`, `start_date`, `end_date`, `bullets`.
- **Involvement YAML** entries require `slug`, `title`, `role`, `date`, plus content fields
  (`what_it_is`, `my_role`, `contributions`, `point_of_view`, `bullets`).
- **Projects** live in `projects.json` (`title`, `tools`, `date`, `links`, `description`).

## TypeScript Configuration
- Strict mode enabled. Path alias `@/*` maps to `./src/*`.
