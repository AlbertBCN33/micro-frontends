# 0004. Each app owns its translations

- **Status:** Accepted
- **Date:** 2026-09-30

## Context

Requirement: every app loads its own `en.json` and `es.json`.

Constraints:

- one active language for the whole page, switched in the shell;
- a remote must work standalone (its own dev server) and composed;
- when composed, the page origin is the shell's, so a relative
  `./i18n/en.json` fetched by a remote would hit the **shell's** server.

## Decision

- **ngx-translate 18 hierarchical services.** The shell provides the root
  `TranslateService`, which owns the language. Each remote's route subtree adds
  `provideScopedTranslations()` (a child service). The child loads the remote's
  own files, follows the root language, and falls back to the root for keys it
  does not define.
- **Files are imported, not fetched.** They live in each app's `src/assets/i18n/`. `(lang) => import(`../assets/i18n/${lang}.json`)`
  is declared inside each app. esbuild emits one content-hashed chunk per
  language per app, served from that app's origin like the rest of its code.
  This solves the origin problem and gives cache-busting for free.
- **ICU MessageFormat** (`ngx-translate-messageformat-compiler`), so plurals
  are grammatical: "1 product", "2 productos", "No products".
- **Namespaced keys.** A remote's keys live under its own root (`MARKET.*`,
  `WISHLIST.*`) and never rely on shell keys, so standalone mode works.
- `LanguagePreference` keeps ngx-translate, localStorage and `<html lang>` in
  sync (screen readers switch pronunciation). The initial language is saved
  choice → browser language → English.
- Prices use `Intl.NumberFormat` through `LocalizedCurrencyPipe`, so apps do not
  register Angular locale data.

## Consequences

- Translation changes deploy with the app that owns them.
  `npm run i18n:check` (in CI) fails on missing keys between languages and on
  invalid ICU syntax, for every app.
- Route titles are translated through the route's own injector
  (`translatedTitle()`), so remote titles resolve from the remote's scope.
- Two i18n libraries to keep compatible (ngx-translate and the ICU compiler).
  Both are small and pinned by NF's shared config.

## Alternatives considered

- **Angular built-in i18n (`$localize`).** Best runtime performance, but one
  build per locale. Switching language means a full reload to another deploy,
  multiplied by every remote. It doesn't fit "each app loads its own files".
- **Transloco with scopes.** A very good fit, and arguably nicer scoping. We
  stayed with ngx-translate because the project already used it, and v18's
  child services cover the need.
- **Fetch JSON over HTTP from each remote's origin.** Works, but needs each
  remote to know its public URL and adds un-hashed files to cache-bust.
