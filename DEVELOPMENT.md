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

- Node.js 22.17.x is the CI baseline. The Docker build image is
  `adguard/node-ssh:22.17--0`.
- Node.js 24.14.0 is also verified locally in this workspace on 2026-05-04.
- pnpm 10.x is required. The exact version is pinned in `package.json`.
- A userscript host is needed for manual browser checks. Use AdGuard for
  Android, Violentmonkey, Tampermonkey, Greasemonkey, or another compatible
  userscript host.
- Docker is optional for local development, but useful when reproducing the CI
  build stages from `Dockerfile`.

There is no `.nvmrc`, `.node-version`, or `engines` field in `package.json`.
Prefer Node.js 22.17.x when matching CI behavior exactly.

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

Runtime code lives in `src/`:

- `src/index.js`: entry point and page routing.
- `src/google-amp.js`: Google AMP link cleanup and AMP redirects.
- `src/yandex-turbo.js`: Yandex Turbo canonical redirects.
- `src/utils.js`: shared DOM and URL helpers.
- `src/exclusions.js`: generated userscript `@exclude` URL patterns.

Build and metadata code lives at the repository root:

- `webpack.config.js`: build target selection and output paths.
- `metadata.plugin.js`: metadata file generation and metadata concatenation.
- `meta.settings.js`: metadata field values per build channel.
- `meta.template.js`: userscript header template and match patterns.
- `locales.js`: Twosky/Crowdin translation download and upload script.

Generated output under `build/` is ignored by git. Do not edit generated files;
change source files and rebuild instead.

### Available Commands

- `pnpm run dev`: builds the development userscript into `build/dev`.
- `pnpm run beta`: builds a minified beta userscript into `build/beta`.
- `pnpm run release`: builds a minified release userscript into `build/release`.
- `pnpm run watch`: runs the development build in watch mode.
- `pnpm run lint`: runs ESLint against `src/`.
- `pnpm run test`: runs metadata and direct browser smoke tests.
- `pnpm run test:metadata`: verifies generated userscript metadata patterns.
- `pnpm run test:e2e`: runs direct Playwright browser smoke tests.
- `pnpm run test:wrapper`: runs userscripts-wrapper e2e tests. It requires
  `USERSCRIPTS_WRAPPER_DIR`.
- `pnpm run locales:download`: downloads translations from Twosky/Crowdin.
- `pnpm run locales:upload`: uploads base translations to Twosky/Crowdin.
- `pnpm run increment`: bumps the patch version in `package.json` without a
  git tag.

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

Run these commands before finishing code or metadata changes:

```sh
pnpm run lint
pnpm run dev
pnpm run test
```

Run wrapper-level tests when a local userscripts-wrapper checkout is available:

```sh
pnpm run dev
USERSCRIPTS_WRAPPER_DIR=/Volumes/dev/userscripts-wrapper pnpm run test:wrapper
```

`pnpm run lint`, `pnpm run dev`, `pnpm run test`,
`pnpm run test:wrapper`, `pnpm run beta`, and `pnpm run release` were verified
in this workspace on 2026-05-04.

No formatter or type checker command is configured. Avoid formatting-only churn
and rely on ESLint plus the Webpack build for automated checks.

For behavior changes, also manually test representative pages in a userscript
host. Pick pages that match the touched path: Google Search, Google News,
Google Images, generic AMP pages, or Yandex Turbo pages.

### Contribution Flow

- Create a branch for the change.
- Keep changes scoped to source, metadata, locale, or documentation files that
  the task requires.
- Follow code guidelines in `AGENTS.md`.
- Update `CHANGELOG.md` for user-visible behavior changes.
- Update `README.md` if install links, build commands, or user-facing behavior
  change.
- Run `pnpm run lint`, `pnpm run dev`, and `pnpm run test` before opening a PR.
- Mention any manual browser checks performed in the PR or final task summary.

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

Use the project script when a task requires a patch version bump:

```sh
pnpm run increment
```

This mutates `package.json`. It does not create a git tag.

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
cd /Volumes/dev/userscripts-wrapper && yarn build
cd /Volumes/dev/wt/disable-amp/fix-AG-53935
pnpm run dev
USERSCRIPTS_WRAPPER_DIR=/Volumes/dev/userscripts-wrapper pnpm run test:wrapper
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
