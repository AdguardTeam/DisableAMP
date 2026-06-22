# DEPLOYMENT.md

Production deployment reference for Disable AMP userscript artifacts.

## Table Of Contents

- [Deployment Model](#deployment-model)
- [Release Channels](#release-channels)
- [Deployment Artifacts](#deployment-artifacts)
- [Environment Variables](#environment-variables)
- [Infrastructure Dependencies](#infrastructure-dependencies)
- [External Integrations](#external-integrations)
- [Error Reporting](#error-reporting)
- [Logging](#logging)
- [Health Checks](#health-checks)
- [Security Notes](#security-notes)
- [Related Documentation](#related-documentation)

## Deployment Model

Disable AMP has no long-running production server. Production consists of static
userscript files published to `userscripts.adtidy.org` and executed by userscript
hosts or AdGuard for Android.

Deployment is handled by GitHub Actions (`publish-release.yml`):

- The `deploy-static-beta` job uploads beta artifacts to the Deployer module
  `disable-amp-beta`.
- The `deploy-static-release` job uploads release artifacts to the Deployer
  module `disable-amp-release`.
- Both jobs target the `userscripts.adtidy.org` environment via the
  `deploy-to-static.yml` reusable workflow.
- The `gh-release` job also creates a GitHub Release with the compiled
  userscript attached as an asset.

CI/CD pipeline details live in `.github/workflows/`; this document only
records the production deployment configuration and runtime dependencies.

## Release Channels

- **Beta**:
    - Published URL:
      `https://userscripts.adtidy.org/beta/disable-amp/1.0/disable-amp.user.js`
    - Metadata URL:
      `https://userscripts.adtidy.org/beta/disable-amp/1.0/disable-amp.meta.js`
- **Release**:
    - Published URL:
      `https://userscripts.adtidy.org/release/disable-amp/1.0/disable-amp.user.js`
    - Metadata URL:
      `https://userscripts.adtidy.org/release/disable-amp/1.0/disable-amp.meta.js`

The URLs are configured in `meta.settings.js` and rendered into userscript
metadata through `meta.template.js`.

## Deployment Artifacts

Each production deployment publishes these required artifacts:

- `disable-amp.user.js`: userscript metadata plus bundled runtime code.
- `disable-amp.meta.js`: userscript metadata for update checks.

The release version is parsed from `CHANGELOG.md` by `tag-from-changelog.yml`
and injected into `package.json` at build time. The compiled userscript
metadata carries the release tag version.

## Environment Variables

- `NODE_ENV`
    - Required: yes for builds.
    - Used by: `webpack.config.js`.
    - Purpose: selects build channel. `BETA` and `RELEASE` produce minified
      production artifacts; any other value falls back to `dev`.
    - Example: `RELEASE`.
- `LOCALES`
    - Required: only for locale sync.
    - Used by: `locales.js`.
    - Purpose: selects translation sync mode. Not used by deployed runtime.
    - Example: `DOWNLOAD`.
- `PNPM_HOME`
    - Required: no.
    - Used by: `Dockerfile`.
  - Purpose: sets pnpm executable path inside the build image.
  - Example: `/pnpm`.
No runtime environment variables are required after artifacts are published. The
userscript runs entirely in the browser page context.

## Infrastructure Dependencies

- **Static artifact hosting**: `userscripts.adtidy.org` serves beta and release
  userscript files.
- **Deployer service**: The `deploy-to-static.yml` workflow uploads artifacts
  to `${DEPLOYER_BASE_URL}/disable-amp-beta` and
  `${DEPLOYER_BASE_URL}/disable-amp-release` (org variable
  `DEPLOYER_BASE_URL`).
- **Build container**: Docker stages use `adguard/node-ssh:22.22--0` and emit
  artifacts from scratch output stages.

There are no production databases, caches, queues, object storage clients, or
server processes in this repository.

## External Integrations

- **Twosky/Crowdin translation API**: `locales.js` uses
  `https://twosky.int.agrd.dev/api/v1` for translation download and upload.
  Project, base locale, languages, and localizable files are configured in
  `.twosky.json`.
- **Userscript update mechanism**: Userscript hosts read `@downloadURL` and
  `@updateURL` from generated metadata. These values come from
  `meta.settings.js`.

No OAuth provider, webhook receiver, payment provider, email provider, or other
runtime third-party service is configured.

## Error Reporting

No Sentry, Bugsnag, Rollbar, or equivalent error reporting integration is
configured. The deployed userscript does not report browser runtime errors to an
external service.

## Logging

- Runtime userscript code does not intentionally emit production logs.
- Build and deployment scripts write plain text logs to GitHub Actions
  stdout/stderr. Docker build steps use `--progress plain` for readable logs.
- `locales.js` writes translation sync success and error messages with
  `console.log` when `LOCALES` is set.

There is no configurable log level and no structured JSON logging.

## Health Checks

There are no `/health`, `/ready`, or `/live` endpoints because this project does
not run a server in production. Production validation is artifact availability at
the beta and release URLs.

## Security Notes

- Do not commit secrets. Credentials for Twosky/Crowdin must be managed
  outside this repository. The Deployer service uses the org variable
  `DEPLOYER_BASE_URL` — no secrets are required for static deploys.
- Keep `@include` and `@exclude` metadata patterns as narrow as possible because
  they control where the userscript executes.
- Do not publish artifacts that were not generated from the expected beta or
  release channel configuration.

## Related Documentation

- [User manual](README.md)
- [Development](DEVELOPMENT.md)
- [LLM agent rules](AGENTS.md)
- [Changelog](CHANGELOG.md)
