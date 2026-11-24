# ![Conduit](project-logo.png)

> [RealWorld](https://github.com/gothinkster/realworld) "Conduit" frontend, rewritten from AngularJS 1.5 to **Angular 21** (standalone components, signals, `@if`/`@for` control flow, functional guards/resolvers/interceptors).

# Getting started

Requires Node `^20.19`, `^22.12` or `>=24`.

```bash
npm install
npm start          # ng serve on http://localhost:4200
npm run build      # production build into dist/conduit
npm test           # unit tests (Vitest) — add --watch=false for a single run
```

### Making requests to the backend API

The app talks to the public RealWorld API at `https://api.realworld.show/api`. To use another backend (e.g. `http://localhost:3000/api`), change `apiUrl` in `src/environments/environment.ts`; it is provided to the app through the `APP_CONSTANTS` injection token (`src/app/core/app.constants.ts`).

### Layout

| Path                    | Contents                                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `src/app/app.routes.ts` | Routes (ported from the UI-Router states)                                                                                |
| `src/app/core/`         | Services (`UserService`, `JwtService`, `ArticlesService`, ...), auth interceptor, guards, resolvers, page-title listener |
| `src/app/layout/`       | Header, footer and the layout shell                                                                                      |
| `src/app/shared/`       | Article list/preview/meta, pagination, favorite/follow buttons, list-errors, `*appShowAuthed`, markdown pipe             |
| `src/app/pages/`        | Home, article, auth, editor, profile, settings                                                                           |

URLs keep the legacy hash form (`/#/article/:slug`, `/#/@username/favorites`, ...), so existing links keep working.

<br />

[![Brought to you by Thinkster](https://raw.githubusercontent.com/gothinkster/realworld/master/media/end.png)](https://thinkster.io)
