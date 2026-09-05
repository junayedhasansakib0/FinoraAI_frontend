# finora-client

Single-page app for **Finora AI** — smart personal finance, powered by AI.

React 19 + Vite + TypeScript with Tailwind CSS 4. This repository is independent of the API
(`finora-server`); it talks to it only over HTTP, using the contract in `ARCHITECTURE.md` §7.

The browser never calls an external service directly and holds no API keys. Session tokens
live in HttpOnly cookies, so nothing sensitive is readable from JavaScript. `AuthContext`
restores the session on boot with `GET /auth/me`, and the axios interceptor renews it silently
when a request comes back 401 (`ARCHITECTURE.md` §6).

## Requirements

- Node.js 22 LTS or newer
- npm 10 or newer

## Setup

Start the API first (`finora-server`, port 5000), then:

```bash
npm install
npm run dev               # http://localhost:5173
```

In development, `/api` is proxied to `http://localhost:5000`, so requests are same-origin
and cookies work without extra configuration.

## Scripts

| Script                 | Purpose                            |
| ---------------------- | ---------------------------------- |
| `npm run dev`          | Vite dev server                    |
| `npm run build`        | Typecheck and build to `dist/`     |
| `npm run preview`      | Serve the production build locally |
| `npm run lint`         | ESLint                             |
| `npm run lint:fix`     | ESLint with autofix                |
| `npm run format`       | Prettier write                     |
| `npm run format:check` | Prettier check (CI)                |
| `npm run typecheck`    | `tsc --noEmit`                     |

## Environment variables

Only `VITE_API_BASE_URL` — a public value, never a secret. See `.env.example`.

- Development: keep the relative `/api/v1` default and let the dev proxy forward it.
- Production: set it to the deployed API base, e.g. `https://api.example.com/api/v1`.

Anything that is not `VITE_`-prefixed and public-safe belongs in the API, not here.

## Layout

```
src/
├── main.tsx        entry point
├── App.tsx         router and providers
├── index.css       Tailwind import and design tokens
├── api/            axios instance and interceptors
├── components/     reusable UI and state components
├── context/        app-wide state (the auth session)
├── features/       domain UI and its own form schemas
├── lib/            constants and formatters
├── pages/          route entry components
└── types/          API response types, mirrored from the contract (R-N7)
```

Components render UI and delegate to hooks and services — no data fetching, no money math
in components. Money is formatted with `Intl.NumberFormat`, never computed on the client.

Design tokens (color, type, radii) are declared once in `src/index.css` and consumed as
Tailwind utilities; no arbitrary hex values in components.

## Documentation

The specification lives in the workspace folder alongside this repository:
`AGENTS.md`, `PROJECT_CONTEXT.md`, `ARCHITECTURE.md`, `DEVELOPMENT_RULES.md`,
`IMPLEMENTATION.md`. Read them before changing anything here.

## License

[MIT](LICENSE)
