# Keshav Sreekantham — Personal Website

> Personal portfolio site.

## 🚀 Live

[www.keshavsreekantham.com](https://www.keshavsreekantham.com)

## 🧩 Tech

- **Framework**: Next.js (App Router) • React • TypeScript
- **Styling**: Tailwind CSS 4 • Framer Motion • a hand-authored mosaic motif
- **Home calendar**: `react-activity-calendar` (GitHub contribution history)
- **Hosting**: Vercel

Static site — no backend, no database, no environment variables.

## 📄 Pages

- **Home (`/`)** — mosaic hero with the headline "Who is Keshav Sreekantham?", section links,
  social/contact/resume buttons, and a vertical GitHub contribution calendar.
- **About (`/about`)** — bio.
- **Projects (`/projects`)** — animated project cards. Content: `src/data/projects.json`.
- **Work (`/work`)** — experience timeline. Content: `rag-docs/keshav_sreekantham_truth.yaml`.
- **Involvement (`/involvement`)** — clubs and activities. Content: `rag-docs/involvement.yaml`.

## 🛠 Develop

```bash
cd personalwebsite
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```
