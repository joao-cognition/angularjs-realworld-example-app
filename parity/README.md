# Conduit parity suite

Same Playwright specs, two projects: `legacy` (AngularJS 1.5 build, `http://localhost:4000`, hash routes) and `angular` (Angular 21, `http://localhost:4200`). `specs/helpers.ts` maps logical routes to each app (`/profile/:u` -> `/#/@u` for legacy).

The public API only shows a logged-in user their own content plus demo-account content, so cross-user flows (favorite, follow) act on demo articles.

## Run

```bash
# Angular app
npm install && npm start                      # repo root, port 4200

# Legacy app (from the baseline commit; Gulp 3 needs Node 10)
git worktree add ../conduit-legacy 2bc11d0
cd ../conduit-legacy && nvm use 10 && npm install && npx gulp build
npx http-server dist -p 4000                  # or any static server

# Suite
cd parity && npm install && npx playwright install chromium
npx playwright test                           # both projects
python3 compose.py                            # report/README.md + report/side-by-side/*.png
```

Results: [`report/README.md`](report/README.md).
