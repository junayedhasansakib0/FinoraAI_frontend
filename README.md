# Finora AI — Client

The single-page web app for **Finora AI**: track income, expenses, budgets, and savings goals, and read AI-generated insights built from your own numbers.

> **Smart Personal Finance, Powered by AI.**

This repository is the **frontend only**. It renders the UI and talks to the Finora AI API
(`finora-server`) exclusively over HTTP — it holds no API keys, touches no database, and runs no
financial math. Session tokens live in HttpOnly cookies, so nothing sensitive is readable from
JavaScript.

`finora-client` and `finora-server` are independent repositories; their only contract is the HTTP
API described in `ARCHITECTURE.md` §7.

---

## ✨ Highlights

- **A full finance workspace** — dashboard, transactions ledger, budgets, savings goals, and multi-month analytics.
- **AI insights & Q&A** — request server-generated reports and ask questions about your aggregates (gated behind a verified email).
- **Cookie-only auth** — session restore on load, silent token refresh on `401`, and protected routes; no token ever reaches JavaScript or `localStorage`.
- **Verification-aware UX** — unverified accounts still use the core app, with a banner and locked AI/analytics surfaces until the email is confirmed.
- **Server-computed money** — the client formats amounts with `Intl.NumberFormat`; it never computes a total.
- **Reference tools** — cached currency and crypto views, never presented as real-time.
- **Built to be found** — per-page titles, Open Graph/Twitter tags, JSON-LD, `robots.txt`, and a sitemap; private `/app/*` routes are explicitly `noindex`.
- **Responsive & accessible** — layouts verified from narrow mobile widths up, with explicit loading, empty, and error states.

---

## 🧱 Tech Stack

| Area | Choice |
| --- | --- |
| UI runtime | React 19 |
| Build tooling | Vite 8 |
| Language | TypeScript 6 (strict) |
| Styling | Tailwind CSS 4 (via `@tailwindcss/vite`), tokens in `index.css` |
| Routing | React Router 8 (SPA guards + `noindex` on private routes) |
| Server state | TanStack Query 5 (cache, refetch, invalidation) |
| Forms & validation | React Hook Form 7 + Zod 4 (`@hookform/resolvers`) |
| HTTP client | axios 1.20 (single instance, cookie credentials, 401-refresh interceptor) |
| Charts | Recharts 3 (code-split into the dashboard/analytics chunk) |
| Testing | Vitest 5 + Testing Library + jsdom |

No UI component framework is used — components under `src/components/ui` (Button, Modal, Select,
TextField) are hand-built on Tailwind.

---

## 🗂️ Project Structure

```
src/
  api/          One module per resource (auth, transactions, budgets, goals, dashboard,
                currency, crypto, ai, quotes) + the shared axios client and interceptors
  components/   Reusable UI: charts, layout (AppShell), states (loading/empty/error), ui/*
  context/      AuthContext — session restore, current user, verification state
  features/     Feature slices (transactions, budgets, goals, dashboard, ai, currency,
                crypto, settings, auth, landing, motivation, ayah, categories-settings)
  hooks/        Data hooks (use-transactions, use-dashboard, use-categories, use-debounced-value)
  lib/          constants, Intl money/date formatting, TanStack query client
  pages/        Route entry points (Dashboard, Transactions, Budgets, Goals, Analytics,
                Currency, Crypto, Ai, AiChat, Settings, Landing, Login, Register, VerifyEmail)
  types/        Shared API response types
  App.tsx       Route table and guards
  main.tsx      App bootstrap
public/         favicon.svg, robots.txt, sitemap.xml
```

---

## 🔐 Authentication (client side)

The client never sees a raw token. Session state is derived from cookies set by the API:

- On load, `AuthContext` calls `GET /auth/me` to restore the session (or resolve to signed-out).
- The axios instance sends `withCredentials: true` so the HttpOnly cookies travel with every request.
- A response interceptor catches `401`, performs a **single** in-flight refresh against
  `POST /auth/refresh`, then retries the original request once; if refresh fails, the session is
  cleared and the user is routed to sign-in.
- Route guards protect `/app/*`; unverified users keep access to core pages but see a banner, and
  AI/analytics surfaces render a locked state until the email is confirmed.

Because auth is cookie-based, there is nothing to store, read, or clear in `localStorage`.

---

## 🔌 API Communication

- The client talks to a single base path, `VITE_API_BASE_URL` (default **`/api/v1`**), through one
  axios instance in `src/api/client.ts` (`withCredentials: true`, request timeout 15s).
- **Development:** Vite proxies `/api` to the local API (`http://localhost:5000`) so requests stay
  same-origin and `SameSite=Lax` cookies are accepted.
- **Production:** `vercel.json` rewrites `/api/*` to the deployed API host, keeping the browser
  same-origin with the SPA. The API host is configured there — update it for your own deployment.
- Responses follow the shared success/error envelope from `ARCHITECTURE.md` §7; API modules unwrap
  it and surface typed errors to TanStack Query.

---

## ⚙️ Environment Variables

Only one variable is read by the client, and it is **build-time and public** — anything prefixed
`VITE_` is inlined into the browser bundle. Never put a secret here.

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | No | `/api/v1` | Relative base is recommended so the dev proxy and the Vercel rewrite keep cookies same-origin. |

Copy `.env.example` to `.env.local` if you need to override it. See `.env.example` for the
authoritative list.

---

## 🚀 Local Development

Requires Node 22 (see `.node-version`) and a running `finora-server` on `http://localhost:5000`.

```bash
npm install
npm run dev        # Vite dev server on http://localhost:5173
```

The dev server proxies `/api` to the local API, so start the backend first.

---

## 🧪 Testing & Quality

```bash
npm run test          # Vitest run (unit + component tests, jsdom)
npm run test:coverage # Tests with coverage
npm run typecheck     # tsc, no emit
npm run lint          # ESLint
npm run lint:fix      # ESLint with --fix
npm run format        # Prettier write
npm run format:check  # Prettier check
```

Tests live beside the code they cover (`*.test.ts` / `*.test.tsx`) with setup in
`src/test/setup.ts`. Network and API calls are mocked — tests never reach the real backend.

---

## 🏗️ Production Build

```bash
npm run build     # tsc -p tsconfig.json && vite build  → dist/
npm run preview   # serve the built dist/ locally
```

The build type-checks first, then emits static assets to `dist/`. Charts are code-split so the
initial route stays lean.

---

## ☁️ Deployment (Vercel)

The SPA is configured to deploy on **Vercel** (`vercel.json` at the repo root):

- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **`/api/*` rewrite** → the deployed API host, so the browser stays same-origin with the API and
  `SameSite=Lax` session cookies are accepted (no `SameSite=None` needed).
- **SPA fallback** → all non-asset routes rewrite to `/index.html` for client-side routing.

Set the API host in `vercel.json` to your own backend before deploying. Vercel's Hobby plan is for
non-commercial use — confirm the current plan terms for your use case.

---

## 🧭 Development Notes

- **No client-side money math.** Totals, budgets, and goal progress come from the API; the client
  only formats with `Intl.NumberFormat`.
- **Reference data is cached, not live.** Currency and crypto views reflect server-cached values and
  are never labelled real-time.
- **Head tags per page.** Titles and SEO metadata are set per route via React 19 head hoisting;
  private `/app/*` routes and auth/verify pages are `noindex`.
- **Decorative surfaces** (motivational quote cards on Transactions/Budgets/Goals, the daily ayah
  card) render server-provided plain text with a fallback and are not financial advice.

---

## 🐛 Troubleshooting

| Symptom | Likely cause / fix |
| --- | --- |
| API calls fail in dev | The backend isn't running on `http://localhost:5000`, or the Vite proxy target is wrong. Start `finora-server` first. |
| Logged out on refresh | Cookies aren't reaching the API. Ensure requests are same-origin (relative `/api/v1` + dev proxy or Vercel rewrite), not a cross-site absolute URL. |
| `401` loops | Refresh cookie missing/expired — sign in again; check the API's cookie paths and `Secure`/`SameSite` settings. |
| Blank page on a deep link | SPA fallback missing — confirm the `/index.html` rewrite in `vercel.json`. |
| Stale content after deploy | Old build cached — rebuild and redeploy; hard-refresh the browser. |

---

## 📄 License

Released under the [MIT License](./LICENSE).




