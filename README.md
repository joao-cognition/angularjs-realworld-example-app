# ![Angular 21 Example App](project-logo.png)

> Example Angular 21 (standalone components + signals) codebase that adheres to the [RealWorld](https://github.com/gothinkster/realworld-example-apps) spec and API.

View the **[demo application](https://angularjs.realworld.io)** or **[learn how to build the application from scratch](https://thinkster.io/angularjs-es6-tutorial)**!

# Getting started

Requires Node 22.12+ (or 20.19+).

1. Clone repo
2. `npm install`
3. `npm start` (runs `ng serve`) and open http://localhost:4200

Other scripts: `npm run build` (`ng build`, output in `dist/conduit`), `npm test` (Vitest unit tests), `npm run format`.

### Making requests to the backend API

For convenience, we have a live API server running at https://api.realworld.show/api for the application to make requests against. You can view [the API spec here](https://github.com/GoThinkster/productionready/blob/master/api) which contains all routes & responses for the server.

The source code for the backend server (available for Node, Rails and Django) can be found in the [main RealWorld repo](https://github.com/gothinkster/realworld).

If you want to change the API URL to a local server, simply edit `src/environments/environment.ts` and change `api` to the local server's URL (i.e. `localhost:3000/api`)

<br />

[![Brought to you by Thinkster](https://raw.githubusercontent.com/gothinkster/realworld/master/media/end.png)](https://thinkster.io)
