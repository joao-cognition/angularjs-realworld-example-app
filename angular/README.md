# Conduit — Angular 21

Angular 21 port of the AngularJS 1.5 Conduit app at the repo root (standalone components, signals, zoneless).

```bash
cd angular
npm ci
npm start            # http://localhost:4200
npm test -- --watch=false
npm run build
```

Layout:

- `src/app/core` — API services, JWT, user session (signals), auth interceptor, guards, title strategy
- `src/app/layout` — header and footer
- `src/app/shared` — article list / preview / meta, pagination, favorite and follow buttons, error list
- `src/app/features/<feature>` — one folder per feature, each with its own `<feature>.routes.ts`

The theme (`src/theme.css`) is the same file the legacy app serves as `assets/main.css`.
Parity against the legacy app is checked by the Playwright suite in `../parity`.
