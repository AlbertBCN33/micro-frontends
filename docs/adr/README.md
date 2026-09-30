# Architecture Decision Records

Short records of the decisions that shape this repository: what was decided,
why, and what it costs. Each one is written so a new team member could
challenge it with the same information the author had.

| #                                             | Decision                                                         | Status   |
| --------------------------------------------- | ---------------------------------------------------------------- | -------- |
| [0001](0001-native-federation.md)             | Native Federation instead of webpack Module Federation           | Accepted |
| [0002](0002-lazy-remotes-runtime-manifest.md) | Remotes are registered lazily from a runtime manifest            | Accepted |
| [0003](0003-cross-app-state-contract.md)      | Cross-app state through a small, versioned shared library        | Accepted |
| [0004](0004-per-app-translations.md)          | Each app owns its translations (ngx-translate child scopes, ICU) | Accepted |
| [0005](0005-no-backend.md)                    | No backend: static catalog behind a typed seam                   | Accepted |
| [0006](0006-client-side-rendering.md)         | Client-side rendering only (no SSR)                              | Accepted |
| [0007](0007-library-boundaries.md)            | Library boundaries, tags and the "second consumer" rule          | Accepted |
| [0008](0008-testing-strategy.md)              | Testing strategy: fast unit tests, e2e against production builds | Accepted |

New decisions: copy [the template](template.md), take the next number, and link
it here. Superseded records stay, marked as such, with a link to the new one.
