# Watchtower – AGENTS.md

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | `tsc -b && vite build` (run both) |
| `npm run lint` | `oxlint` (not ESLint) |
| `npm run deploy` | `npm run build` then `gh-pages -d dist` |
| `npm run preview` | `vite preview` |

No test framework is configured.

## Architecture

- **Entrypoint:** `src/main.tsx` → `src/App.tsx`
- **React 19** + **TypeScript 6.0** + **Vite 8**
- **Styling:** Plain CSS with custom properties (`src/index.css`, `src/App.css`). Tailwind CSS v4 is **not wired** (the `@tailwindcss/vite` plugin is missing from `vite.config.ts`).
- **Persistence:** Firebase Firestore (`src/firebase.ts`), scoped to `users/{userId}`.
- **Auth:** Firebase Auth with Google sign-in (`signInWithPopup`).
- **Data source:** TMDB API (`api.themoviedb.org/3`). TMDB poster base: `https://image.tmdb.org/t/p/w500`.

## TypeScript quirks

- `verbatimModuleSyntax` is **on** – use `import type` for type-only imports.
- `erasableSyntaxOnly` is **on** – no `enum`, no `namespace`, no `parameter properties`.
- `noUnusedLocals` and `noUnusedParameters` are **errors**.

## Env vars (all `VITE_*`)

Values have hardcoded fallbacks in `src/config.ts` and `src/firebase.ts`:

- `VITE_TMDB_API_KEY`
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`

## CI

- `.github/workflows/deploy-pages.yml` – deploys to GitHub Pages on push to `main`.
- Build step passes `VITE_*` env vars from secrets/vars.
- No lint or test step in CI.

## Key packages

- `firebase` (runtime dep)
- `react`, `react-dom` (runtime)
- `oxlint` (lint)
- `gh-pages` (deploy helper)
