# @mfe/shared-util-i18n

Per-app translations on top of ngx-translate 18. See
[ADR 0004](../../../docs/adr/0004-per-app-translations.md).

- `provideRootTranslations(importer, lang)`: in the shell, or in a standalone
  remote.
- `provideScopedTranslations(importer)`: on a remote's route. It adds a child
  scope that loads the remote's own files and follows the root language.
- `LanguagePreference`: switches the language and keeps `<html lang>` and
  storage in sync.
- `LocalizedCurrencyPipe`, `translatedTitle(key)`.

Declare the importer **inside the app**, so the bundler resolves the app's own
files:

```ts
provideScopedTranslations((lang) => import(`../i18n/${lang}.json`));
```

Messages use ICU MessageFormat. `npm run i18n:check` validates key parity and
syntax.
