# 0001. Native Federation instead of webpack Module Federation

- **Status:** Accepted
- **Date:** 2026-09-30

## Context

The first version of this repo used Nx 20's Angular Module Federation
(`@nx/angular:host`/`remote`, webpack, `@module-federation/enhanced`) on
Angular 18.

Upgrading to Angular 22 and Nx 23 changed the ground:

- Nx 23 **deprecates** `@nx/angular:host`/`remote` and its executors, which
  are removed in Nx 24. The Nx docs point Angular users to
  `@angular-architects/native-federation`.
- The Angular CLI's default builder is esbuild (`@angular/build:application`).
  webpack Module Federation keeps an Angular app on the legacy webpack builder,
  so it misses build-speed and tooling improvements.

## Decision

Use **Native Federation** (`@angular-architects/native-federation` 22.x) on
top of the standard `@angular/build:application` builder:

- each app is a normal Nx Angular application. The NF builder wraps the esbuild
  target (`esbuild` → `build`) and emits `remoteEntry.json` plus the shared
  bundles;
- runtime composition uses web standards: ES modules, and import maps polyfilled
  by `es-module-shims`;
- shared dependencies (Angular, RxJS, ngx-translate, our `@mfe/*` libraries)
  are singletons with `strictVersion`, derived from `package.json`.

## Consequences

- No dependency on a deprecated code path; builds use the same builder as
  any other Angular 22 app.
- Nx keeps doing what it's good at (affected, caching, boundaries, release).
  Federation config lives in each app's `federation.config.mjs`.
- `main.ts` must not import any shared package: they only resolve after
  `initFederation()` has built the import map. This bit us once. It is now
  enforced by an ESLint rule on `main.ts` and `remote-manifest.ts`.
- NF's dev builder shares one TypeScript build-info cache across projects, and
  starting several dev servers at the same instant races on it (TypeScript
  "Debug Failure" on Windows). `npm start` (`tools/scripts/serve-all.mjs`)
  starts the apps one after another. It is an upstream issue to report and
  track, not something to work around in app code.

## Alternatives considered

- **Stay on `@nx/angular` Module Federation.** It works today, but it is a
  dead end in Nx 24, and choosing it on a greenfield rebuild would be hard to
  justify.
- **`@nx/module-federation` with rspack for Angular.** Still bundler-specific,
  and the Nx docs no longer recommend it for Angular.
- **Build-time composition (one app, libraries per domain).** Simpler and
  faster, but no independent deployment, which is the whole point of the
  exercise. For a single team this would be the right call.
