# 0003. Cross-app state through a small, versioned shared library

- **Status:** Accepted
- **Date:** 2026-09-30

## Context

Three apps need the wishlist:

- **market** adds and removes items;
- **wishlist** lists, removes and clears them;
- **shell** shows a live count in the header and a summary on the dashboard.

Remotes must not import each other; they only meet at runtime through the
shell.

## Decision

`@mfe/shared-data-access-wishlist` is the contract:

- `WishlistItem`: a **snapshot** of the product at the moment it was saved
  (id, name, price, currency, image URL, date). The wishlist never calls the
  market's API, so the two domains evolve independently.
- `WishlistStore`: signal state with intent methods (`add`, `remove`,
  `toggle`, `clear`), `providedIn: 'root'`. Native Federation shares the
  library as a singleton, so every app resolves the same instance from the
  shell's root injector.
- `WishlistStorage`: a persistence **port**. The default adapter is
  localStorage, with a versioned key (`mfe.wishlist.v1`), untrusted-input
  validation and cross-tab sync through `storage` events. A Firestore or HTTP
  adapter is a provider swap.
- The library is versioned with Nx Release. Removing or renaming a field of
  `WishlistItem` is a **major** version; see [0007](0007-library-boundaries.md).

## Consequences

- Simple and type-safe: one import, signals, no wiring per app.
- Runtime coupling is explicit and checked: NF enforces the library version
  (`strictVersion`) when a remote built against another major is loaded.
- A singleton only works if every app shares the library. A remote that
  bundled its own copy would silently get a second store. Guarded by NF's
  shared config and by an e2e test (saving in market updates the shell
  badge).
- Routes remain an untyped contract (`/market/:id` is linked from the
  wishlist). It is documented at the use site and covered by e2e.

## Alternatives considered

- **Custom DOM events or `BroadcastChannel` between apps.** Maximum
  decoupling, but you rebuild state, typing and persistence by hand, and every
  consumer re-implements the reducer. Worth it with different frameworks or
  truly independent release trains; overkill here.
- **A global store (NgRx) in the shell.** It centralises every domain's state
  in the host, which is the opposite of team autonomy.
- **URL/query-param state only.** Fine for filters (the market does this), but
  not for data that must survive across pages and sessions.
