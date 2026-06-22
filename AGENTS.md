# AGENTS.md

Working reference for AI coding agents and contributors working in this
repository.

## Table Of Contents

- [Project Overview](#project-overview)
- [Technical Context](#technical-context)
- [Project Structure](#project-structure)
- [Build And Test Commands](#build-and-test-commands)
- [Contribution Instructions](#contribution-instructions)
- [Code Guidelines](#code-guidelines)
    - [System Design](#system-design)
    - [Architecture](#architecture)
    - [Code Quality](#code-quality)
    - [Testing](#testing)
    - [Dependency Management](#dependency-management)
    - [Configuration & Documentation](#configuration--documentation)
    - [Markdown Formatting](#markdown-formatting)
    - [Other](#other)

## Project Overview

Disable AMP by AdGuard is a browser userscript that prevents AMP pages from
opening on supported search and news surfaces. It rewrites Google AMP links,
redirects AMP documents to canonical pages, redirects Yandex Turbo pages, and
ships generated userscript metadata for dev, beta, and release builds.

The runtime code is plain browser JavaScript. The build pipeline uses Webpack,
Babel, a custom metadata plugin, and locale files to generate installable
`.user.js` and `.meta.js` artifacts.

## Technical Context

- **Language/Version**: JavaScript. No `engines` field is declared in
  `package.json`; the Docker build image is `adguard/node-ssh:22.17--0`.
- **Primary Dependencies**: Webpack 5, Babel, ESLint with Airbnb base config,
  `copy-webpack-plugin`, `clean-webpack-plugin`, `replace-in-file`, `glob`,
  `cp-file`, `fs-extra`, `axios`, and `form-data`.
- **Storage**: No runtime storage. Build-time configuration and translations
  are stored in repository files.
- **Testing**: Metadata checks and Playwright e2e tests are configured in
  `package.json`. CI runs lint, dev build, metadata tests, and direct browser
  smoke tests. Userscripts-wrapper e2e tests are local-only and require
  `USERSCRIPTS_WRAPPER_DIR`.
- **Target Platform**: Browser userscript hosts and AdGuard for Android.
  `browserslist` targets IE 11 for transpilation compatibility.
- **Project Type**: Browser userscript, closest to a content-script style
  browser extension.
- **Performance Goals**: Keep runtime lightweight; page-load and DOM mutation
  work should stay small because the script runs on many matched pages.
- **Constraints**: Userscript metadata include and exclude patterns control
  where code runs. Runtime code must use browser APIs available after
  transpilation for the declared target.
- **Scale/Scope**: Public AdGuard userscript distributed to stable and beta
  channels, with localized metadata for many languages.

## Project Structure

```text
.
├── src/                         # Runtime userscript modules
│   ├── index.js                 # Entry point and page routing
│   ├── google-amp.js            # Google AMP link cleanup and redirects
│   ├── yandex-turbo.js          # Yandex Turbo canonical redirects
│   ├── utils.js                 # Shared DOM and URL helpers
│   └── exclusions.js            # Userscript @exclude URL patterns
├── locales/                     # Localized metadata messages
├── tests/                       # Metadata and Playwright e2e tests
│   ├── metadata.test.ts         # Generated metadata regression checks
│   ├── e2e/                     # Direct built-userscript browser tests
│   └── wrapper/                 # userscripts-wrapper integration tests
├── .github/workflows/           # GitHub Actions CI/CD workflows
├── build/                       # Generated artifacts, ignored by git
├── webpack.config.js            # Webpack build for dev, beta, release
├── metadata.plugin.js           # Custom userscript metadata generator
├── meta.settings.js             # Metadata fields per release channel
├── meta.template.js             # Userscript header template
├── locales.js                   # Translation download/upload script
├── babel.config.js              # Babel preset configuration
├── playwright.config.ts         # Browser e2e test configuration
├── .eslintrc.js                 # ESLint rules
├── .twosky.json                 # Translation project mapping
├── Dockerfile                   # CI test and build plans
├── package.json                 # pnpm scripts and dependencies
├── pnpm-lock.yaml               # Locked dependency resolution
├── README.md                    # User manual and install links
├── DEVELOPMENT.md               # Local setup and contributor workflow
├── DEPLOYMENT.md                # Production publishing reference
└── CHANGELOG.md                 # Release history
```

> **Repository note**: This repo is private at
> `AdGuardSoftwareLimited/ext-disable-amp`. A public mirror is automatically
> synced to `AdguardTeam/DisableAMP` on every push to `master` via the
> `mirror.yml` workflow.

## Build And Test Commands

- `pnpm run dev` builds a development userscript into `build/dev`.
- `pnpm run beta` builds a beta userscript into `build/beta`.
- `pnpm run release` builds a production userscript into `build/release`.
- `pnpm run watch` runs the development build in watch mode.
- `pnpm run lint` runs ESLint against `src/`.
- `pnpm run test` runs metadata and direct browser smoke tests.
- `pnpm run test:metadata` checks generated metadata patterns.
- `pnpm run test:e2e` runs direct Playwright browser smoke tests.
- `pnpm run test:wrapper` runs wrapper-level e2e tests and requires
  `USERSCRIPTS_WRAPPER_DIR`.
- `pnpm run locales:download` downloads translations from Twosky/Crowdin.
- `pnpm run locales:upload` uploads base translations to Twosky/Crowdin.

## Contribution Instructions

- You MUST verify changed code with the configured linter, formatter, and type
  or build checks.

  Use the following commands:
    - `pnpm run lint` to run the linter.
    - No formatter command is configured; avoid formatting-only churn.
    - No type checker is configured; use `pnpm run dev` as the build and syntax
      verification command.
    - `pnpm run dev` to verify the development bundle and generated metadata.
    - `pnpm run test` to run metadata and direct browser smoke tests.
    - `pnpm run test:wrapper` when userscripts-wrapper behavior is touched or
      when changing userscript match patterns.

- You MUST update unit tests for changed code. If no test harness exists for the
  touched behavior, document that gap in the final response and prefer adding
  focused tests when the task scope allows it.

- You MUST make all tests pass before finishing. In the current repository, that
  means `pnpm run lint`, `pnpm run dev`, and `pnpm run test`. Run
  `pnpm run test:wrapper` when wrapper behavior or userscript match patterns
  are touched.

- When making changes to the project structure, ensure the Project Structure
  section in `AGENTS.md` is updated and remains valid.

- If the prompt asks you to refactor or improve existing code, check whether the
  lesson can be expressed as a code guideline. If it can, add it to the relevant
  Code Guidelines section in `AGENTS.md`.

- After completing a task, you MUST verify that new code follows the Code
  Guidelines in this file.

- When changing URL match behavior, update the userscript include or exclude
  patterns in `meta.template.js` or `src/exclusions.js` and verify generated
  metadata with `pnpm run dev`.

- When changing localized metadata keys, update `locales/en/messages.json` and
  keep `meta.settings.js` field names consistent with those keys.

## Code Guidelines

### System Design

Design for a browser userscript environment:

- The script runs in a sandboxed browser environment with limited APIs; request
  and match only the page origins needed by `meta.template.js`.
- Keep runtime code lightweight because every added byte and DOM query can slow
  matched pages.
- Treat runtime modules like content scripts: they may inspect and mutate the
  current page, but should not own unrelated build or metadata logic.
- Do not store critical runtime state in memory. Userscript execution can be
  repeated across navigations, frames, and dynamically updated pages.
- Use DOM observation carefully. `MutationObserver` callbacks should be small,
  idempotent, and safe to run multiple times.
- Never block the page main thread with long loops, synchronous network calls,
  or heavy parsing.
- Design for updates by keeping metadata generation deterministic and by
  preserving existing include, exclude, download, and update URL behavior unless
  the task explicitly changes it.

### Architecture

- **Separation of Concerns**: Keep routing, feature behavior, shared helpers,
  metadata generation, and locale syncing in separate files.
- **Single Responsibility Principle**: Each runtime module should have one
  reason to change: page routing, Google AMP handling, Yandex Turbo handling, or
  shared utility behavior.
- **Dependency Direction**: Runtime feature modules may depend on `utils.js`;
  utilities must not import feature modules or the entry point.
- **Explicit Boundaries**: Use exported functions for cross-module behavior;
  avoid reaching into another module's implementation details.
- **Data Flow Clarity**: Read page state from `document.location` and DOM nodes,
  derive canonical URLs, then apply one clear redirect or link mutation.
- **Minimize Coupling, Maximize Cohesion**: Keep site-specific behavior in the
  module that owns that site surface.
- **Make Invalid States Impossible**: Validate URLs before redirecting, return
  `null` for missing canonical links, and avoid redirecting without a verified
  target.
- **Observability Built-in**: Runtime logging is intentionally minimal for a
  userscript; add diagnostics only when they are useful and not noisy on normal
  pages.
- **Keep It Boring**: Prefer vanilla browser APIs and straightforward string or
  URL operations over clever parsing.

The easiest way to maintain these principles is layered architecture. This
project's layers, from top to bottom:

```text
Entry point and page routing: src/index.js
     ↓
Runtime feature modules: src/google-amp.js, src/yandex-turbo.js
     ↓
Shared browser helpers: src/utils.js
     ↓
Browser DOM and URL APIs

Build configuration: webpack.config.js, babel.config.js
     ↓
Metadata and locale tooling: metadata.plugin.js, meta.settings.js, locales.js
     ↓
Generated artifacts: build/<channel>/disable-amp.user.js
```

Runtime feature modules may call shared helpers. Shared helpers must not depend
on runtime feature modules or the entry point. Build tooling may read runtime
configuration such as `src/exclusions.js`, but runtime modules must not import
build tooling.

**Known exclusions** (to be fixed):

- `src/exclusions.js` is a hardcoded blocklist that requires code changes and a
  rebuild for every new excluded site.
- `src/yandex-turbo.js` checks `!canonicalLink` twice in the fallback path; the
  second check makes the `data-message` fallback unreachable after a missing
  canonical link.

### Code Quality

- Use ES modules in `src/` and CommonJS in root build scripts, matching existing
  files.
- Keep runtime code dependency-free. Use browser-native `URL`, DOM selectors,
  event listeners, and `MutationObserver` APIs.
- Keep indentation at 4 spaces. ESLint enforces Airbnb base rules, `max-len` at
  120 characters, and import newline grouping.
- Prefer named exports for runtime helpers and feature functions.
- Validate URLs before assigning `document.location.href` or replacing link
  targets.
- Make DOM mutations idempotent. Observers can call handlers many times during a
  single page lifetime.
- Keep comments useful and specific. Existing comments usually explain browser
  behavior, issue context, or non-obvious metadata generation.
- Do not edit generated files under `build/`; change source, metadata template,
  or configuration files instead.
- Do not relax `.eslintrc.js` rules for one-off code. Fix the code or explain
  why a rule-level change is needed.

### Testing

- Use `pnpm run lint`, `pnpm run dev`, and `pnpm run test` as the minimum
  verification path for source and metadata changes.
- `pnpm run test:metadata` validates generated userscript metadata. Run it
  after changing include, exclude, locale metadata, or template fields.
- `pnpm run test:e2e` runs direct Playwright smoke tests against local fixtures.
- `pnpm run test:wrapper` runs e2e tests through userscripts-wrapper. It
  requires a built wrapper checkout in `USERSCRIPTS_WRAPPER_DIR`.
- For URL parsing, canonical extraction, and redirect decisions, prefer adding
  focused tests near the touched behavior.
- For userscript behavior, manually verify representative Google Search, Google
  News, Google Images, generic AMP pages, and Yandex Turbo pages when the task
  touches those paths.
- Keep test data small and concrete. Use real URL shapes from issues or the
  changelog when they document a regression.

### Dependency Management

- **Pin all dependency versions explicitly**: Do not use version ranges that
  allow automatic upgrades to untested versions.
- **Prefer vanilla solutions**: Use JavaScript and browser built-in APIs when
  they adequately solve the problem. Only add a dependency when it provides
  significant value over a vanilla implementation.
- **Reputable sources only**: Dependencies MUST come from well-established,
  actively maintained projects. Evaluate by download counts, repository
  activity, and known maintainers.
- **Avoid unpopular libraries**: Do NOT add niche or obscure packages with
  limited community adoption. These pose security risks and may become
  unmaintained.
- **Minimize dependency count**: Each new dependency increases attack surface,
  bundle size, and maintenance burden. Justify every addition.
- **Use the latest stable version**: When adding a new dependency, explicitly
  check the package registry for the latest stable release and use it. Do not
  copy outdated version numbers from memory, training data, or lock files from
  other projects.

**Rationale**: Fewer, well-vetted dependencies reduce security vulnerabilities,
supply chain risks, and long-term maintenance costs.

**Known exclusions** (to be fixed):

- `package.json` currently uses caret ranges for all dev dependencies. Future
  dependency updates should move toward exact pinned versions.

### Configuration & Documentation

- Runtime match scope is configured in `meta.template.js` with userscript
  `@include` and generated `@exclude` lines.
- Release-channel metadata is configured in `meta.settings.js`. Keep download
  and update URLs aligned with the channel being changed.
- Excluded sites live in `src/exclusions.js` and are injected into generated
  metadata by `metadata.plugin.js`.
- Translation project mapping lives in `.twosky.json`; localized strings live in
  `locales/<lang>/messages.json`.
- Do not hardcode secrets. Locale sync endpoints are repository config, but
  credentials or tokens must come from the environment or CI secrets.
- Update `README.md` when install links or user-facing behavior change.
- Update `DEVELOPMENT.md` when local setup, build commands, or contributor
  workflow change.
- Update `DEPLOYMENT.md` when production artifact publishing, release channel
  URLs, or deployment configuration change.
- Update `CHANGELOG.md` for release-visible behavior changes, especially new
  include/exclude patterns and site-specific fixes.
- Update this file when structure, commands, architecture, or code guidelines
  change.

### Markdown Formatting

All Markdown files MUST follow these formatting rules:

- **Line length**: Keep lines at most 80 characters. This is not a hard
  lint gate, but SHOULD be followed for readability. Lines inside fenced
  code blocks are exempt from this limit.
- **Unordered lists**: Use dashes (`-`) for bullet points. Indent nested list
  items by 4 spaces.
- **Emphasis**: Use asterisks (`*`) for emphasis (`*italic*`, `**bold**`). Do
  NOT use underscores.
- **Headings**: Duplicate heading names are allowed only among sibling headings
  (same parent level). Avoid duplicates across different levels.
- **Inline HTML**: Avoid raw HTML in Markdown. The only allowed elements are
  `<a>`, `<p>`, `<details>`, `<summary>`, and `<img>`.
- **Trailing spaces**: Do NOT leave trailing whitespace on any line. Do
  NOT use two-space line breaks -- use a blank line instead.
- **Bare URLs**: Bare URLs are permitted and do not need to be wrapped in angle
  brackets.
- **Table formatting**: Align table columns with padding when the table fits
  within 80 characters. If the table exceeds 80 characters or triggers an MD060
  linter warning, switch to a compact format using single spaces only. This
  applies to the separator row as well -- it should be written as `| --- |`,
  not `|--|`.

  Example of correct layout:

  ```markdown
  | Col1 | Col2 |
  | --- | --- |
  | Value1 | Value2 |
  ```

  Do NOT use extra padding or alignment characters beyond single spaces.

**Rationale**: Uniform Markdown formatting improves readability for both humans
and AI agents that consume project documentation.

### Other

- Keep generated userscript metadata deterministic. A source-only change should
  not reorder unrelated locale fields or exclude entries.
- Preserve Keep a Changelog style in `CHANGELOG.md` and reference related issue
  numbers when known.
- Release versions are driven by `CHANGELOG.md` via `tag-from-changelog.yml`;
  the version is injected into `package.json` at build time.
