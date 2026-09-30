# 0007. Library boundaries, tags and the "second consumer" rule

- **Status:** Accepted
- **Date:** 2026-09-30

## Context

Monorepos drift into "everything imports everything" unless the structure is
enforced. With micro-frontends that drift is worse: an accidental import from
one remote into another turns runtime composition into build-time coupling.

## Decision

**Tags** on every project, enforced by `@nx/enforce-module-boundaries`:

| Tag                | May depend on                              |
| ------------------ | ------------------------------------------ |
| `type:app`         | `type:ui`, `type:data-access`, `type:util` |
| `type:ui`          | `type:ui`, `type:util`                     |
| `type:data-access` | `type:data-access`, `type:util`            |
| `type:util`        | `type:util`                                |
| `scope:<app>`      | its own scope, `scope:shared`              |
| `scope:shared`     | `scope:shared`                             |

**Library placement.** Code moves into a shared library when it has a _second
consumer_. Until then it lives in the app that owns it. The market's catalog
model and filtering stay in `apps/market`; the card, the wishlist contract and
i18n helpers are shared because two or more apps use them.

**Versioning.** Shared libraries are independently versioned with Nx Release
and conventional commits (`nx release`, see `.github/workflows/release.yml`).
Versions are bumped in the **source** `package.json`. Native Federation reads
it at build time and enforces it at runtime (`strictVersion`), so a breaking
change to a contract is visible to remotes deployed on their own schedule.

**Presentational UI.** `@mfe/shared-ui` has no i18n or state dependency:
components take translated strings and project actions.

## Consequences

- Remote-to-remote imports fail lint. The architecture diagram is enforced, not
  just documented.
- Versions mean something even though everything builds from source: they are
  the compatibility signal between independently deployed apps.
- Publishing to npm is intentionally skipped. The libraries are consumed from
  source, and the release workflow versions, changelogs and tags only.

## Alternatives considered

- **A library per feature from day one** (`market/feature-catalog`,
  `market/data-access`…). It is the Nx textbook, but for one consumer it adds
  indirection without benefit. The rule above scales into it when needed.
- **Fixed (lockstep) versions for all libraries.** Simpler, but every change
  would look breaking to every remote.
