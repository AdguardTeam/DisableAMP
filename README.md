# Disable AMP by AdGuard

Disable AMP by AdGuard is a userscript that opens supported AMP and Yandex
Turbo pages as their original non-AMP pages. It is for people who browse with
AdGuard for Android or a userscript manager and prefer canonical website pages
instead of AMP wrappers.

> **Repository**: Development happens in the private repo
> `AdGuardSoftwareLimited/ext-disable-amp`. A public mirror is available at
> [`AdguardTeam/DisableAMP`](https://github.com/AdguardTeam/DisableAMP).

## Table Of Contents

- [What It Does](#what-it-does)
- [Key Concepts](#key-concepts)
- [Installation](#installation)
    - [AdGuard For Android](#adguard-for-android)
    - [Userscript Managers](#userscript-managers)
- [Quick Start](#quick-start)
- [Features](#features)
- [Supported Page Types](#supported-page-types)
- [Usage Notes](#usage-notes)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)

## What It Does

AMP pages often wrap publisher content in a faster but reduced version of the
original page. Disable AMP detects supported AMP or Turbo pages and sends the
browser to the canonical page published by the site owner.

Depending on the page, the script can:

- Rewrite AMP links before you click them.
- Redirect an AMP page to its canonical URL after the page loads.
- Redirect Yandex Turbo pages to their original URL.
- Remove visible AMP indicators from links after replacing them.

## Key Concepts

- **Userscript**: A small script installed in AdGuard for Android or a browser
  userscript manager. It runs only on URLs matched by its metadata.
- **AMP page**: A page that loads AMP runtime scripts from
  `cdn.ampproject.org` and usually points to a canonical page.
- **Canonical page**: The original non-AMP URL declared by the publisher in the
  page metadata.
- **Yandex Turbo page**: A Yandex-hosted lightweight version of a page that can
  point back to an original URL.
- **Stable and beta channels**: Stable is recommended for normal use. Beta is
  useful when testing upcoming fixes.

## Installation

### AdGuard For Android

AdGuard for Android includes Disable AMP by AdGuard. It is pre-installed and
disabled by default.

To use it:

1. Open AdGuard for Android.
2. Open userscript settings.
3. Enable Disable AMP by AdGuard.
4. Open a supported AMP or Turbo page in your browser.

### Userscript Managers

Install one of these URLs in Violentmonkey, Tampermonkey, Greasemonkey, or
another compatible userscript manager:

- Stable:
  https://userscripts.adtidy.org/release/disable-amp/1.0/disable-amp.user.js
- Beta:
  https://userscripts.adtidy.org/beta/disable-amp/1.0/disable-amp.user.js

The userscript metadata includes update URLs, so compatible managers can check
for updates automatically.

## Quick Start

1. Install or enable the userscript.
2. Search on Google from a mobile browser.
3. Open a result marked as AMP.
4. The result should open as the original page instead of the AMP version.

You can also open a supported AMP URL directly. If the page exposes a valid
canonical URL, the script redirects to that URL.

## Features

- **Google Search AMP cleanup**: Removes AMP-specific attributes from Google
  result links so the browser opens the original destination.
- **Google News AMP cleanup**: Replaces encoded AMP destinations in Google News
  links with canonical URLs when available.
- **Google Images AMP cleanup**: Handles image-result AMP link variants and
  hides the AMP marker after a link is rewritten.
- **Generic AMP redirect**: Redirects supported AMP pages to their canonical
  non-AMP URL.
- **AMP CDN link replacement**: Rewrites AMP CDN links such as
  `cdn.ampproject.org` or `amp.` host variants when the original URL can be
  derived.
- **Yandex Turbo redirect**: Redirects supported Yandex Turbo and
  `turbopages.org` pages to their canonical or original URL.

## Supported Page Types

The userscript runs on Google, Google News, Yandex, `turbopages.org`, and common
AMP URL patterns. Examples include:

- `https://www.google.*/*`
- `https://news.google.*/*`
- `https://yandex.*/*`
- `https://*.turbopages.org/*`
- `https://*/amp/*`
- `https://*/*/amp/*`
- `https://amp.*`
- `https://*/*/amp`
- `https://*/*.amp*`
- `https://*/*-amp*`
- `https://*/*_amp*`
- `https://*/*=amp*`
- `https://*/?amp*`
- `https://*/*&amp*`
- `https://*/*&amp=1*`
- `https://*?amp=*`
- `https://*/*?amp=1*`
- `https://*/amp-*/*`
- `https://*/ampNews/*`
- `https://*/NewsViewAmp/*`
- `https://*/*/articleViewAmp*`
- `https://*/*/amp_articleshow/*`
- `https://*/*/?noamp=*`

Some matching sites are excluded to avoid redirect loops or site-specific
breakage. If a page does not redirect, it may be excluded or may not expose a
usable canonical URL.

## Usage Notes

- The script changes only pages matched by its userscript metadata.
- The script does not create its own replacement page. It redirects to the URL
  declared by the publisher when that URL is available.
- Non-AMP pages that match an AMP-like URL pattern should stay unchanged unless
  they contain the AMP runtime marker and a valid canonical URL.
- If the target website declares an incorrect canonical URL, the browser may be
  redirected to that incorrect destination.
- The beta channel can change sooner than the stable channel and may be less
  predictable.

## Troubleshooting

- **The script is installed but nothing changes**: Check that the userscript is
  enabled in AdGuard or your userscript manager.
- **A specific page does not redirect**: Check whether the page has a canonical
  URL and whether it is a supported AMP or Turbo URL shape.
- **A site reloads repeatedly**: Disable the userscript for that site and report
  the URL. The site may need to be excluded.
- **Google result still opens an AMP page**: Refresh the search results page and
  try again. Google can inject links dynamically, and the script rewrites them
  after DOM updates.
- **A beta install behaves unexpectedly**: Switch to the stable URL and retry.

When reporting a problem, include the original URL, the URL you expected to
open, the browser or userscript host, and whether you use stable or beta.

## Documentation

- [Development](DEVELOPMENT.md)
- [LLM agent rules](AGENTS.md)
- [Deployment and configuration](DEPLOYMENT.md)
- [Changelog](CHANGELOG.md)
