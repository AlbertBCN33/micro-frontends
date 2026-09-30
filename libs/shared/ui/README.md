# @mfe/shared-ui

Presentational Angular components shared by every app, plus the design tokens.

- `ui-page-title`: the single `<h1>` of a route, with an optional subtitle.
- `ui-product-card`: product tile. The title is the link; actions are projected.
- `ui-state-message`: empty, loading and error states with the right live-region
  role.
- `src/styles/theme.css`: CSS custom properties (light and dark), base styles,
  and `.mfe-button`. Every app lists it in its `styles`.

No i18n or state dependencies: components take translated strings as inputs.

`npx nx test shared-ui` · `npx nx lint shared-ui`
