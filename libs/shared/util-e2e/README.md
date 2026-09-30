# @mfe/shared-util-e2e

Playwright fixtures shared by every app's e2e suite (`apps/*/e2e`):

- `test` / `expect`: every test starts from a clean device, and fails on any
  uncaught page error.
- `expectAccessible(page)`: axe, WCAG 2.2 A/AA, zero violations allowed.
- `seedLocalStorage(page, entries)`: start the app from a given state.

Tagged `type:e2e-util`: only e2e projects may import it, and apps cannot.
