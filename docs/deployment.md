# Deployment (Firebase Hosting, free Spark plan)

Each app is its own Firebase Hosting **site** in one Firebase project, so each
deploys independently ([ADR 0009](adr/0009-deployment.md)):

| App      | Hosting target | Site ID (`.firebaserc`)          | URL                                            |
| -------- | -------------- | -------------------------------- | ---------------------------------------------- |
| shell    | `shell`        | `micro-frontends-3e1a2`          | https://micro-frontends-3e1a2.web.app          |
| market   | `market`       | `micro-frontends-3e1a2-market`   | https://micro-frontends-3e1a2-market.web.app   |
| wishlist | `wishlist`     | `micro-frontends-3e1a2-wishlist` | https://micro-frontends-3e1a2-wishlist.web.app |

`.firebaserc` is the single source of truth for site IDs: the production
`federation.manifest.json` and the post-deploy checks are derived from it.

Hosting is included in the free **Spark** plan; no billing account is needed.
Check the current Hosting quotas (storage, daily transfer) in the Firebase
console. This app is a few hundred kB per site.

## One-time setup

1. **Enable Hosting.** In the [Firebase console](https://console.firebase.google.com/),
   open the project → _Build_ → _Hosting_ → _Get started_. You can skip the
   CLI steps the wizard shows. This creates the default site (the shell's).

2. **Log in with the CLI** (the version is pinned in the `deploy` targets):

    ```sh
    npx firebase-tools@15.32.0 login
    ```

3. **Create the remotes' sites.** Site IDs are global across Firebase; if one
   is taken, pick another and change it in `.firebaserc`. Nothing else needs to
   change.

    ```sh
    npx firebase-tools@15.32.0 hosting:sites:create micro-frontends-3e1a2-market --project micro-frontends-3e1a2
    npx firebase-tools@15.32.0 hosting:sites:create micro-frontends-3e1a2-wishlist --project micro-frontends-3e1a2
    ```

4. **First deployment**, from your machine:

    ```sh
    npm run deploy          # builds; deploys market, wishlist, then the shell
    npm run deploy:verify   # checks the live sites (CORS, caching, manifest)
    ```

5. **Credentials for GitHub Actions.** In the
   [Google Cloud console](https://console.cloud.google.com/iam-admin/serviceaccounts)
   for the same project:
    1. _Create service account_, e.g. `github-deployer`.
    2. Grant it the **Firebase Hosting Admin** role, and nothing broader.
    3. _Keys_ → _Add key_ → _JSON_. A file downloads; treat it as a password.
    4. In GitHub: _Settings_ → _Secrets and variables_ → _Actions_ →
       _New repository secret_, named
       **`FIREBASE_SERVICE_ACCOUNT_MICRO_FRONTENDS_3E1A2`**, with the whole
       JSON file as the value. Then delete the downloaded file.

    If the first CI deployment fails with a permission error that names a
    missing role or API, grant that role to the same service account.

6. **Turn on continuous deployment.** In GitHub: _Settings_ → _Secrets and
   variables_ → _Actions_ → _Variables_ → _New repository variable_:
   **`DEPLOY_ENABLED`** = `true`. Until then, the `deploy` job is skipped, so
   `main` stays green before the setup is done.

## Continuous deployment

After the setup, every push to `main` runs the `CI` workflow:

1. the `main` job: format, i18n, lint, typecheck, test, build, e2e (affected);
2. the `deploy` job, **only if CI passed**:
    - deploys only the **affected** apps (`nx show projects --affected`),
      remotes first, then the shell, so the live shell never points at a remote
      version that isn't deployed yet;
    - writes the production manifest into the built shell (no rebuild);
    - verifies the live sites (`tools/scripts/verify-deploy.mjs`).

Runs on `main` queue instead of cancelling each other, so a deployment is never
interrupted halfway. The job uses the GitHub `production` environment, where
you can add required reviewers if you want a manual approval gate.

**Deploy everything** (e.g. after changing `firebase.json`, which is not part
of any app): _Actions_ → _CI_ → _Run workflow_ on `main` → tick
**deploy-all**.

**Roll back:** Firebase console → _Hosting_ → the site → _Release history_ →
_Rollback_. Each site rolls back independently.

## Next steps worth considering

- Replace the JSON key with
  [Workload Identity Federation](https://github.com/google-github-actions/auth#workload-identity-federation-through-a-service-account)
  (keyless, short-lived credentials).
- Preview channels per pull request (`firebase hosting:channel:deploy`), with
  the e2e suites pointed at them (`E2E_SHELL_URL`, `E2E_MARKET_URL`,
  `E2E_WISHLIST_URL`).
