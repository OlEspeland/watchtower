# Watchtower

Watchtower is a small web app for keeping track of movies you've watched and movies you want to watch. Use it to add titles, rate films you've seen, mark progress, and maintain a simple watchlist.

## Features

- Add movies to your library or watchlist.
- Mark movies as "Watched" or "To Watch".
- Give simple ratings (e.g. 1–5 stars) to movies you've seen.
- Filter and sort by status, rating, and date added.

## Getting Started

This project uses Vite with React and TypeScript.

Prerequisites:

- Node.js (16+ recommended)

Install and run locally:

```bash
npm install
npm run dev
```

Open the app in your browser at the URL printed by Vite (usually http://localhost:5173).

## Usage

- Add a movie: Click the "Add" button and enter the movie title and optional details (year, notes).
- Mark status: Use the status toggle or dropdown to mark a movie as `Watched` or `To Watch`.
- Rate a movie: After marking as `Watched`, assign a rating (1–5). Ratings are visible in lists and detail views.
- Filter & sort: Use the UI controls to show only `Watched` or `To Watch` items, or to sort by rating or date added.

## Data

Watchtower is intended as a lightweight personal tracker. Depending on the app's current implementation it may store data in-browser (localStorage) or persist through a backend. Check the code under `src/` to see how movie data is stored and how to extend it.

Key places to look:

- Components: `src/` — UI components and pages
- State: `src/` — where movie list state is managed

## Extending

- Add fields: Extend the movie model with extra fields (genre, runtime, watched date).
- Add persistence: Hook up a backend or API to persist data across devices.
- Import/export: Add CSV or JSON import/export for backups and migrations.

## Contributing

Contributions, bug reports, and feature suggestions are welcome — open an issue or a pull request.

## License

Specify a license for your project here (e.g. MIT) or keep it private.

---

Enjoy keeping track of the films you love (and the ones you're planning to watch) with Watchtower!
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
