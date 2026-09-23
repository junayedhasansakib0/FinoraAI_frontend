<div align="center">

# 🪙 Finora AI — Client

### The single-page app for smart, AI-powered personal finance

**React 19 · Vite · TypeScript · Tailwind CSS 4 · TanStack Query**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

The browser client for **Finora AI** — track income and expenses, watch budgets, and (soon)
get AI-generated insights. It talks to the API ([`finora-server`](../server)) **only over HTTP**,
using the contract in `ARCHITECTURE.md` §7.

**The browser never calls an external service directly and holds no API keys.** Session tokens
live in HttpOnly cookies, so nothing sensitive is readable from JavaScript. `AuthContext` restores
the session on boot with `GET /auth/me`, and an axios interceptor renews it silently when a request
comes back `401` (`ARCHITECTURE.md` §6).

## ✨ Highlights

- ⚡ **Fast by default** — Vite build, route-level code splitting so Recharts never ships to the sign-in page.
- 🔐 **No secrets in the bundle** — auth is cookie-only; the client formats money but never computes it.
- 🎯 **Server state, done right** — TanStack Query for lists, totals, and cache invalidation on every mutation.
- 🧾 **Typed end to end** — API response types are mirrored from the contract; forms validate with Zod + React Hook Form.
- 🎨 **One design system** — color, type, and radii are declared once as tokens in `index.css` and consumed as Tailwind utilities.
- 📱 **Responsive & accessible** — layouts verified from 360px up, with semantic states for loading, empty, and error.

## 🧰 Tech stack

| Concern | Choice |
| --- | --- |
| Framework | React 19 |
| Build tool | Vite 8 |
| Language | TypeScript 6 (strict) |
| Styling | Tailwind CSS 4 (design tokens in `index.css`) |
| Routing | React Router 8 |
| Server state | TanStack Query 5 |
| Forms | React Hook Form 7 + Zod 4 |
| HTTP | axios (single instance, cookie credentials) |
| Charts | Recharts 3 (dashboard chunk only) |

## 🚀 Getting started

**Prerequisites:** Node.js 22 LTS+ and npm 10+. Start the API first ([`finora-server`](../server), port 5000), then:

```bash
npm install
npm run dev               # http://localhost:5173
```

In development, `/api` is proxied to `http://localhost:5000`, so requests are same-origin and
cookies work with no extra configuration.

## 📜 Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` / `lint:fix` | ESLint (with autofix) |
| `npm run format` / `format:check` | Prettier write / check (CI) |
| `npm run typecheck` | `tsc --noEmit` |

## 🔑 Environment variables

Only `VITE_API_BASE_URL` — a **public** value, never a secret. See `.env.example`.

- **Development:** keep the relative `/api/v1` default and let the dev proxy forward it.
- **Production:** set it to the deployed API base, e.g. `https://api.example.com/api/v1`.

> Anything that is not `VITE_`-prefixed and public-safe belongs in the API, not here.

## 🗂️ Project layout

```
src/
├── main.tsx        entry point
├── App.tsx         router and providers
├── index.css       Tailwind import and design tokens
├── api/            axios instance and interceptors
├── components/     reusable UI and state components
├── context/        app-wide state (the auth session)
├── features/       domain UI and its own form schemas
├── hooks/          data-fetching hooks (TanStack Query)
├── lib/            constants and formatters
├── pages/          route entry components
└── types/          API response types, mirrored from the contract (R-N7)
```

Components render UI and delegate to hooks and services — **no data fetching and no money math in
components**. Money is formatted with `Intl.NumberFormat`, never computed on the client. Design
tokens (color, type, radii) are declared once in `src/index.css`; no arbitrary hex in components.

## ✅ Status & roadmap

Built in sequential phases (see `IMPLEMENTATION.md`). Screens shipped so far:

| Screen | Status |
| --- | --- |
| Sign in / register, protected routing | ✅ |
| Transactions ledger — filter, sort, paginate, category management | ✅ |
| Dashboard — KPIs, charts, category & trend analytics | ✅ |
| Budgets — month picker, progress bars, warning/exceeded states | ✅ |
| Savings goals | ⏳ next |
| Currency & crypto tools | 🔜 |
| AI insights & Q&A, landing page | 🔜 |

## 📚 Documentation

The specification is the source of truth and lives in the workspace folder alongside this
repository — read it before changing anything here:

- `AGENTS.md` — how to work on the project
- `PROJECT_CONTEXT.md` — product scope and free-tier facts
- `ARCHITECTURE.md` — system design and the API contract (§7)
- `DEVELOPMENT_RULES.md` — enforceable MUST/NEVER rules
- `IMPLEMENTATION.md` — phase plan and completion criteria

## 📄 License

[MIT](LICENSE)

