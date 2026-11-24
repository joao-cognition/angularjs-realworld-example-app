# Conduit — Angular 21 port

Standalone-component / signals rewrite of the AngularJS 1.5 app in `../src/js` (kept for reference until parity sign-off).

| Task | Command (Node 24) |
| --- | --- |
| Install | `npx -y npm@11 install` |
| Dev server (public API) | `NG_CLI_ANALYTICS=false npx ng serve --port 4200` |
| Dev server (local API, for E2E) | `NG_CLI_ANALYTICS=false npx ng serve --port 4200 --configuration local` |
| Unit tests (Vitest) | `npx ng test --watch=false` |
| Production build | `npx ng build` |

Routes use path URLs (old `/#/...` links are rewritten on load), so any static host must serve `index.html` for unknown paths (SPA fallback), otherwise refreshing `/article/:slug` or `/@user` 404s.

The API base URL lives in `src/environments/environment*.ts`; `--configuration local` points the app at `http://localhost:8080`.

## E2E (`../e2e`)

The public `api.realworld.show` returns the same token for every account, so multi-user flows cannot be tested against it.
The suite runs against a local RealWorld backend, e.g. [spring-boot-realworld-example-app](https://github.com/COG-GTM/spring-boot-realworld-example-app):

```bash
# backend (Java 11)
JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64 ./gradlew bootRun
# app
cd angular && npx ng serve --port 4200 --configuration local
# tests (global setup seeds 12 demo articles; 1 worker by default because the backend's SQLite locks on concurrent writes)
cd e2e && npm install && npx playwright install chromium && npx playwright test --project=angular
```
