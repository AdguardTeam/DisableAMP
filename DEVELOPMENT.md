# DEVELOPMENT.md

Developer guide for setting up, running, and changing Disable AMP locally.

## Table Of Contents

- [Prerequisites](#prerequisites)
    - [Required Tools](#required-tools)
    - [Optional Tools](#optional-tools)
- [Getting Started](#getting-started)
    - [Install Dependencies](#install-dependencies)
    - [Configure Environment](#configure-environment)
    - [Build And Load Locally](#build-and-load-locally)
- [Development Workflow](#development-workflow)
    - [Project Layout](#project-layout)
    - [Available Commands](#available-commands)
    - [Userscript Metadata Model](#userscript-metadata-model)
    - [Verification](#verification)
    - [Contribution Flow](#contribution-flow)
    - [Running the Full CI Pipeline Locally](#running-the-full-ci-pipeline-locally)
- [Common Tasks](#common-tasks)
    - [Change Userscript Match Patterns](#change-userscript-match-patterns)
    - [Change Metadata Fields](#change-metadata-fields)
    - [Sync Translations](#sync-translations)
    - [Bump Package Version](#bump-package-version)
    - [Refresh Browserslist Data](#refresh-browserslist-data)
- [Troubleshooting](#troubleshooting)
    - [Browserslist Data Is Outdated](#browserslist-data-is-outdated)
    - [Package Manager](#package-manager)
    - [Wrapper Test Needs Environment](#wrapper-test-needs-environment)
    - [Locales Option Missing](#locales-option-missing)
    - [Built Script Does Not Run](#built-script-does-not-run)
    - [Generated Files Keep Changing](#generated-files-keep-changing)
- [Additional Resources](#additional-resources)

## Prerequisites

### Required Tools

- Node.js 22.22 is the CI baseline.
- pnpm >=10.33.4 and <11 is required.
- A userscript host is needed for manual browser checks. Use AdGuard for
  Android, Violentmonkey, Tampermonkey, Greasemonkey, or another compatible
  userscript host.
- Docker is optional for local development, but useful when reproducing the CI
  build stages from `Dockerfile`.

`package.json` declares an `engines` field requiring `node >=22` and
`pnpm >=10.33.4 <11`.

### Optional Tools

- VS Code with the ESLint extension helps surface the same lint rules used by
  `pnpm run lint`.
- `rg` is useful for searching metadata patterns and source modules.

## Getting Started

### Install Dependencies

Clone the repository, then install dependencies with pnpm:

```sh
pnpm install --frozen-lockfile
```

Use `--frozen-lockfile` so local installs match `pnpm-lock.yaml` and CI
behavior.

> **Repository**: Clone from the private repo
> `https://github.com/AdGuardSoftwareLimited/ext-disable-amp.git`. A public
> mirror at `AdguardTeam/DisableAMP` is synced automatically but should not be
> used for development.

### Configure Environment

No `.env` file is required for normal development.

The project uses these environment variables in scripts:

- `NODE_ENV`: selected by package scripts. Use `DEV`, `BETA`, or `RELEASE`.
- `LOCALES`: selected by locale scripts. Use `DOWNLOAD` or `UPLOAD`.
- `PNPM_HOME`: used in Docker builds, defaults to `/pnpm` there.

Do not add credentials to the repository. Translation service credentials, if
needed by your environment, must come from local shell config or CI secrets.

### Build And Load Locally

Create a development build:

```sh
pnpm run dev
```

The build writes these files:

```text
build/dev/disable-amp.meta.js
build/dev/disable-amp.user.js
build/dev/variables.txt
```

Load `build/dev/disable-amp.user.js` in a userscript host to test behavior in a
browser. For active development, run the watcher:

```sh
pnpm run watch
```

The watcher rebuilds `build/dev/disable-amp.user.js` after source, metadata, or
locale changes.

## Development Workflow

### Project Layout

The full module tree with per-file descriptions is in
[Project Structure](AGENTS.md#project-structure) in `AGENTS.md`. For local
development, note the split between runtime code in `src/` and build/metadata
tooling at the repository root.

Generated output under `build/` is ignored by git. Do not edit generated files;
change source files and rebuild instead.

### Available Commands

The canonical build, test, and lint command reference is
[Build And Test Commands](AGENTS.md#build-and-test-commands) in `AGENTS.md`.
Treat it as the single source of truth for script names; the workflow steps
below call the same commands inline where a step needs them.

### Userscript Metadata Model

Userscript metadata is generated from a template and release-channel settings.
This replaces the old inline README metadata notes with the current source of
truth.

- `meta.template.js` contains the userscript header and placeholders in the
  `[PLACEHOLDER_NAME]` format.
- `meta.settings.js` provides values for placeholders per release channel.
- `metadata.plugin.js` copies the template, injects exclusions from
  `src/exclusions.js`, replaces simple placeholders, expands localized fields,
  and prepends the generated metadata to `disable-amp.user.js`.

`meta.settings.js` exports `releaseChannels` with these sections:

- `common`: options applied to every build channel.
- `dev`: development-only options, including the `Dev` metadata postfix.
- `beta`: beta-channel URLs and the `Beta` metadata postfix.
- `release`: release-channel URLs without a postfix.

Webpack merges `common` with the selected channel. Channel-level `fields`
override or extend `common.fields`.

Metadata plugin options:

- `filename`: base metadata file name. The plugin writes
  `[filename].meta.js` and prepends it to `[filename].user.js`.
- `postfix`: optional text appended to localized fields when the field enables
  `usePostfix`.
- `metadataTemplate`: optional template path. Defaults to
  `./meta.template.js`.
- `localesDir`: optional locale directory. Defaults to `./locales`.
- `fields`: placeholder values keyed by placeholder name without brackets.

Field values can be plain strings or localized field option objects. Localized
field options use:

- `messageKey`: key in each `locales/<lang>/messages.json` file.
- `metaName`: userscript metadata key, such as `name` or `description`.
- `usePostfix`: whether to append the channel postfix to the localized value.

Example:

```js
const releaseChannels = {
    common: {
        fields: {
            USERSCRIPT_VERSION: pkg.version,
            USERSCRIPT_NAME: {
                messageKey: 'name',
                metaName: 'name',
                usePostfix: true,
            },
            USERSCRIPT_DESCRIPTION: {
                messageKey: 'description',
                metaName: 'description',
            },
        },
    },
    beta: {
        postfix: 'Beta',
        fields: {
            DOWNLOAD_URL: 'https://userscripts.adtidy.org/beta/disable-amp/1.0/disable-amp.user.js',
            UPDATE_URL: 'https://userscripts.adtidy.org/beta/disable-amp/1.0/disable-amp.meta.js',
        },
    },
};
```

### Verification

The mandatory verification path and manual-page testing guidance live in
[Contribution Instructions](AGENTS.md#contribution-instructions) and the
[Testing](AGENTS.md#testing) guidelines in `AGENTS.md`; follow them from there
to keep command references in one place. No formatter or type checker is
configured, so rely on ESLint plus the Webpack build.

For wrapper-level e2e tests, set up the local environment described in
[Wrapper Test Needs Environment](#wrapper-test-needs-environment).

### Contribution Flow

- Create a branch for the change.
- Keep changes scoped to source, metadata, locale, or documentation files that
  the task requires.
- Follow code guidelines in `AGENTS.md`.
- Update `CHANGELOG.md` for user-visible behavior changes.
- Update `README.md` if install links, build commands, or user-facing behavior
  change.
- Run the mandatory verification commands listed in
  [Contribution Instructions](AGENTS.md#contribution-instructions) before
  opening a PR.
- Mention any manual browser checks performed in the PR or final task summary.

### Running the Full CI Pipeline Locally

The GitHub Actions CI (`.github/workflows/ci.yml`) runs lint, test, and
build inside Docker. To reproduce the same pipeline locally:

```sh
# Lint + test + dev build (matches the test-output Docker target)
DOCKER_BUILDKIT=1 docker build --progress plain --target test-output .

# Build release artifacts (matches the build-output Docker target)
DOCKER_BUILDKIT=1 docker build --progress plain --target build-output --output ./artifacts .
```

The compiled userscript files appear in `./artifacts/`:

```text
artifacts/disable-amp.user.js
artifacts/disable-amp.meta.js
```

## Common Tasks

### Change Userscript Match Patterns

1. Edit include patterns in `meta.template.js`.
2. Add site exclusions in `src/exclusions.js` when the userscript must not run
   on a matching origin or path.
3. Run `pnpm run dev`.
4. Inspect `build/dev/disable-amp.meta.js` to confirm generated metadata.
5. Manually load `build/dev/disable-amp.user.js` and test the affected page.

### Change Metadata Fields

1. Edit static field values in `meta.settings.js`.
2. Edit metadata placeholders in `meta.template.js` only when the generated
   header structure needs to change.
3. For localized fields, update `locales/en/messages.json` first.
4. Run `pnpm run dev` and inspect `build/dev/disable-amp.meta.js`.

### Sync Translations

Download translations:

```sh
pnpm run locales:download
```

Upload the base locale:

```sh
pnpm run locales:upload
```

These commands call `https://twosky.int.agrd.dev/api/v1` and can change many
files under `locales/`. Review the diff carefully before committing.

### Bump Package Version

Release versions are driven by `CHANGELOG.md`. The `prepare-release.yml`
workflow opens a release-bump PR via `create-release-pr.yml`, and
`publish-release.yml` injects the version from the changelog tag into
`package.json` at build time. Manual version bumps with `pnpm run increment`
are no longer the primary mechanism.

### Refresh Browserslist Data

If Webpack prints that `caniuse-lite` is outdated, refresh Browserslist data:

```sh
npx update-browserslist-db@latest
```

Review `package.json` afterward. The updater may add and then remove temporary
dependencies; keep only meaningful lockfile changes.

## Troubleshooting

### Browserslist Data Is Outdated

Symptom:

```text
Browserslist: browsers data (caniuse-lite) is outdated
```

Fix:

```sh
npx update-browserslist-db@latest
pnpm run dev
```

### Package Manager

The repository uses pnpm. If pnpm is missing, install the pinned package
manager version:

```sh
PNPM_VERSION="$(node -p "require('./package.json').packageManager.split('@').pop()")"
npm install --global "pnpm@${PNPM_VERSION}"
```

### Wrapper Test Needs Environment

`pnpm run test:wrapper` needs a built userscripts-wrapper checkout. The wrapper
repository still uses Yarn, so build it there first, then pass its path:

```sh
cd /path/to/userscripts-wrapper && yarn build
cd /path/to/disable-amp
pnpm run dev
USERSCRIPTS_WRAPPER_DIR=/path/to/userscripts-wrapper pnpm run test:wrapper
```

### Locales Option Missing

Symptom:

```text
Option DOWNLOAD/UPLOAD locales is not set
```

Run one of the package scripts instead of calling `node locales.js` directly:

```sh
pnpm run locales:download
pnpm run locales:upload
```

### Built Script Does Not Run

- Check whether `meta.template.js` has an `@include` pattern for the page URL.
- Check whether `src/exclusions.js` adds an `@exclude` pattern for the page URL.
- Rebuild with `pnpm run dev` after metadata changes.
- Reload or reinstall `build/dev/disable-amp.user.js` in the userscript host.

### Generated Files Keep Changing

`build/` is generated output and ignored by git. If generated files differ,
check source files first:

- `meta.template.js`
- `meta.settings.js`
- `src/exclusions.js`
- `locales/<lang>/messages.json`

## Additional Resources

- `README.md`: user manual, install links, supported page types, and usage
  troubleshooting.
- `AGENTS.md`: project structure, architecture, contribution rules, and code
  guidelines.
- `DEPLOYMENT.md`: production artifact publishing and deployment configuration.
- `CHANGELOG.md`: release-visible changes and issue references.
