# ![Angular 21 RealWorld Example App](project-logo.png)

> Angular 21 (standalone components, signals, zoneless) codebase that adheres to the [RealWorld](https://github.com/gothinkster/realworld) spec and API.

This app was rewritten from the original AngularJS 1.5 (ES6 + components, Gulp/Browserify) version. The legacy source is in git history (commit `2bc11d0`).

# Getting started

Requires Node `^20.19`, `^22.12` or `>=24`.

```bash
npm install
npm start          # ng serve -> http://localhost:4200
npm run build      # ng build -> dist/browser
npm test           # unit tests (Vitest via ng test)
npm run format     # Prettier
```

### Structure

```
src/app/
  core/       models, API URL, services (Api, Jwt, User, Articles, Comments, Tags, Profile),
              auth interceptor, auth guards, title strategy, window.__conduit_debug__
  shared/     article list/preview/meta, favorite + follow buttons, pagination, list-errors,
              markdown + default-image pipes
  layout/     header, footer
  features/   home, auth (login/register), article (+comments), editor, profile, settings
```

### Routes

| Route | Page |
| --- | --- |
| `/`, `/?feed=following`, `/tag/:tag` (+ `?page=N`) | Home: global feed, your feed, tag filter |
| `/login`, `/register` | Sign in / sign up (signed-in users are sent home) |
| `/editor`, `/editor/:slug` | New / edit article (requires sign in) |
| `/settings` | Settings + logout (requires sign in) |
| `/article/:slug` | Article, comments, favorite, follow |
| `/profile/:username`, `/profile/:username/favorites` | Profile articles / favorites |

### Making requests to the backend API

The app uses the public RealWorld API at `https://api.realworld.show/api`. To use another backend, change `API_URL` in `src/app/core/api.config.ts`. The JWT is stored in `localStorage` under `jwtToken` and sent as `Authorization: Token <jwt>`.

### Parity suite

`parity/` holds a Playwright suite that runs the same specs against the legacy AngularJS app (port 4000) and this app (port 4200), and composes side-by-side screenshots. See [`parity/README.md`](parity/README.md).

<br />

[![Brought to you by Thinkster](https://raw.githubusercontent.com/gothinkster/realworld/master/media/end.png)](https://thinkster.io)
