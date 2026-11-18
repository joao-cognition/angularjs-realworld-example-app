# Conduit parity report: AngularJS 1.5 → Angular 21

Both apps run side by side against the same API (`https://api.realworld.show/api`):

| App | Stack | URL |
| --- | --- | --- |
| Legacy (baseline) | AngularJS 1.5.11, UI-Router, Gulp 3 + Browserify (Node 10) | http://localhost:4000 |
| Angular | Angular 21, standalone components, signals, `@angular/build` (Node 24) | http://localhost:4200 |

The same 16 Playwright specs run once per app (`legacy` and `angular` projects in `playwright.config.ts`).
Specs use logical routes (`/article/x`); `helpers.ts` maps them to `/#/article/x` for the legacy app.
They assert visible text, counts, enabled state and URLs, never framework internals.

## Results: 32 / 32 passed

| Flow | Spec | Legacy | Angular |
| --- | --- | --- | --- |
| Global feed (anonymous), pagination | `home.spec.ts` › global feed | ✅ | ✅ |
| Tag filter | `home.spec.ts` › tag filter | ✅ | ✅ |
| Article page, Markdown, comments (anonymous) | `article.spec.ts` › article page + comments | ✅ | ✅ |
| Unknown article → home | `article.spec.ts` | ✅ | ✅ |
| Sign up (validation errors, then success) | `auth.spec.ts` › sign up | ✅ | ✅ |
| Sign in (bad, then good credentials) | `auth.spec.ts` › sign in | ✅ ¹ | ✅ |
| Auth guards (settings/editor anonymous, login/register signed in) | `auth.spec.ts` › auth guards | ✅ | ✅ |
| Publish, render, comment, edit, delete | `editor.spec.ts` | ✅ | ✅ |
| Editing someone else's article → home | `editor.spec.ts` | ✅ | ✅ |
| Profile + Favorited Articles tab | `profile.spec.ts` | ✅ | ✅ |
| Profile pagination | `profile.spec.ts` | ✅ | ✅ |
| Unknown profile → home | `profile.spec.ts` | ✅ | ✅ |
| Settings update + logout | `settings.spec.ts` | ✅ ² | ✅ |
| Favorite / unfavorite | `social.spec.ts` | ✅ | ✅ |
| Follow an author, see them in Your Feed | `social.spec.ts` | ✅ | ✅ |
| Anonymous favorite → sign up | `social.spec.ts` | ✅ | ✅ |

¹ ² Legacy bugs, asserted as-is on legacy and fixed in Angular (spec branches on the app, annotated `legacy-bug`):

1. **Bad sign-in shows no error.** The API answers bad credentials with 401 and the AngularJS `authInterceptor` hard-reloads on every 401, wiping the form. Angular only reloads when a request that carried a JWT gets a 401, so `credentials invalid` is shown.
2. **Invalid email is silently ignored in Settings.** AngularJS's `type=email` validator sets the model to `undefined`, so the field is dropped from the PUT and the save "succeeds". Angular sends it and shows the API's `email is invalid`.

## Side-by-side screenshots

Legacy on the left, Angular on the right (`side-by-side/*.png`, built by `compose.py`; raw full-page shots in `screens/<app>/`).
"Pixel diff" is the share of pixels that differ by more than 32/255 after aligning both pages at the top-left; the only differences are the generated usernames/titles and dates in the data each run creates.

| Page | Side by side | Pixel diff |
| --- | --- | --- |
| home | [01-home.png](side-by-side/01-home.png) | 0.18% |
| tag-filter | [02-tag-filter.png](side-by-side/02-tag-filter.png) | 0.11% |
| article | [03-article.png](side-by-side/03-article.png) | 0.23% |
| profile | [04-profile.png](side-by-side/04-profile.png) | 0.05% |
| profile-favorites | [05-profile-favorites.png](side-by-side/05-profile-favorites.png) | 0.11% |
| profile-page-2 | [06-profile-page-2.png](side-by-side/06-profile-page-2.png) | 0.44% |
| sign-up | [07-sign-up.png](side-by-side/07-sign-up.png) | 0.0% |
| home-signed-in | [08-home-signed-in.png](side-by-side/08-home-signed-in.png) | 0.12% |
| sign-in | [09-sign-in.png](side-by-side/09-sign-in.png) | 0.0% |
| sign-in-error | [10-sign-in-error.png](side-by-side/10-sign-in-error.png) | 1.12% |
| settings | [11-settings.png](side-by-side/11-settings.png) | 0.32% |
| editor | [12-editor.png](side-by-side/12-editor.png) | 0.2% |
| article-own-with-comment | [13-article-own-with-comment.png](side-by-side/13-article-own-with-comment.png) | 0.59% |
| article-favorited | [14-article-favorited.png](side-by-side/14-article-favorited.png) | 0.26% |
| profile-following | [15-profile-following.png](side-by-side/15-profile-following.png) | 0.17% |
| your-feed | [16-your-feed.png](side-by-side/16-your-feed.png) | 0.18% |

`sign-in-error` differs by design (legacy bug 1 above); the rest is generated data.

## Build

| | Legacy (`gulp build`) | Angular (`ng build`) |
| --- | --- | --- |
| Build time (clean, this VM) | 2.1 s | 3.2 s |
| JS + CSS loaded on first page (raw / gzip) | 305.5 kB / 91.9 kB (`main.js` + `main.css`) | 305.5 kB / 83.6 kB (initial chunks + styles) |
| Total JS + CSS emitted (raw / gzip) | 305.5 kB / 91.9 kB | 407 kB / 124 kB (rest is lazy route chunks; `article` is 49 kB because of `marked`) |

## Run it

```bash
# Legacy on :4000 (Node 10 for Gulp 3)
nvm use 10 && npm ci && npx gulp            # from the repo root

# Angular on :4200 (Node 24)
cd angular && nvm use 24 && npm ci && npx ng serve --port 4200
npx ng test --watch=false                   # unit tests: services, interceptor, guards, Markdown pipe

# Parity (both apps running)
cd parity && npm ci && npx playwright install chromium
npx playwright test                         # or test:legacy / test:angular
python3 compose.py                          # side-by-side PNGs + pixel-diff.json (needs Pillow)
```

## Notes on the shared API

`api.realworld.show` keeps what a user creates (articles, favorites, follows) visible only to that user's token, so the social specs act on its seeded public articles and authors and undo their favorites/follows in `finally`; profile pagination is checked as the author.
Its `GET /user` is not concurrency-safe: 4 of 20 concurrent calls with 4 different tokens came back as the wrong account (reproduced with plain `fetch`, no browser involved). Both apps call it on boot, so either can briefly show another user's name when other clients hit the API at the same time.
`createUser()` only uses tokens whose round-trip matches, and `playwright.config.ts` retries a test up to 2 times; the final run below needed no retries (32 passed, 0 flaky).
