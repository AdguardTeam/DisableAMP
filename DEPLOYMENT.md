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

Deployment is handled by Bamboo deployment plans:

- `disable-amp - deploy beta` publishes beta artifacts from source plan
  `ADGEXT-DABSPECS`.
- `disable-amp - deploy release` publishes release artifacts from source plan
  `ADGEXT-DARELEASESPECS`.
- Both deployment plans target the `userscripts.adtidy.org` environment.
- Both plans download build artifacts and call
  `bamboo-deploy-publisher/deploy.sh` with the channel name.

CI/CD pipeline details live in `bamboo-specs/`; this document only records the
production deployment configuration and runtime dependencies.

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

Build plans also generate `variables.txt`, which contains `version=<package
version>`. Bamboo injects that value as `bamboo.userscriptMeta.version` for
release naming and git tagging.

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
- `bamboo_buildNumber`
    - Required: yes for CI cleanup.
    - Used by: `bamboo-specs/scripts/cleanup.sh`.
    - Purpose: proves cleanup runs inside Bamboo before wiping the disposable
      workspace.
    - Example: `1234`.

No runtime environment variables are required after artifacts are published. The
userscript runs entirely in the browser page context.

## Infrastructure Dependencies

- **Static artifact hosting**: `userscripts.adtidy.org` serves beta and release
  userscript files.
- **Bamboo deployment environment**: The deployment environment name is
  `userscripts.adtidy.org`; deploy permissions are granted to the
  `extensions-developers` group.
- **Deployment publisher**: Deployment plans checkout the
  `bamboo-deploy-publisher` repository and run its `deploy.sh` script with
  `disable-amp-beta` or `disable-amp-release`.
- **Build container**: Docker stages use `adguard/node-ssh:22.11--0` and emit
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
- Build and deployment scripts write plain text logs to Bamboo stdout/stderr.
  Bamboo scripts use `set -x` and redirect stderr to stdout for a single log
  stream.
- `locales.js` writes translation sync success and error messages with
  `console.log` when `LOCALES` is set.

There is no configurable log level and no structured JSON logging.

## Health Checks

There are no `/health`, `/ready`, or `/live` endpoints because this project does
not run a server in production. Production validation is artifact availability at
the beta and release URLs.

## Security Notes

- Do not commit secrets. Credentials for Bamboo, `bamboo-deploy-publisher`, or
  Twosky/Crowdin must be managed outside this repository.
- Keep `@include` and `@exclude` metadata patterns as narrow as possible because
  they control where the userscript executes.
- Do not publish artifacts that were not generated from the expected beta or
  release channel configuration.

## Related Documentation

- [User manual](README.md)
- [Development](DEVELOPMENT.md)
- [LLM agent rules](AGENTS.md)
- [Changelog](CHANGELOG.md)
