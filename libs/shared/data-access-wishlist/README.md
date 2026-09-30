# @mfe/shared-data-access-wishlist

The contract between the shell, the market and the wishlist. See
[ADR 0003](../../../docs/adr/0003-cross-app-state-contract.md).

- `WishlistItem`: a snapshot of a product when it was saved.
- `WishlistStore`: signal state with `add`, `remove`, `toggle` and `clear`.
  Native Federation shares it as a singleton.
- `WishlistStorage`: a persistence port. `LocalStorageWishlistStorage` is the
  default; `InMemoryWishlistStorage` is for tests.

**Versioning:** this library is released with `nx release`. Adding a field is a
minor change. Removing or renaming one is a **major** change (mark the commit
with `BREAKING CHANGE:`), because remotes deploy independently and Native
Federation enforces the version at runtime.
