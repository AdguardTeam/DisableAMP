# Disable AMP Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog], and this project adheres to [Semantic Versioning].

[Keep a Changelog]: https://keepachangelog.com/en/1.0.0/
[Semantic Versioning]: https://semver.org/spec/v2.0.0.html

## [1.0.51] - 2024-10-23

### Added

- `cleanAmpLink` function, that forces to open google news link in new tab, necessary for proper redirection. [#102].

### Fixed

- Link breakage due to deletion of amp string. [#102].

[1.0.51]: https://github.com/AdguardTeam/Scriptlets/compare/v1.0.49...v1.0.51
[#102]: https://github.com/AdguardTeam/DisableAMP/issues/102

## [1.0.49] - 2024-10-18

### Added

- Redirect to canonical website for `amppoject` pages [#98], [#96], [#100].

[1.0.49]: https://github.com/AdguardTeam/Scriptlets/compare/v1.0.47...v1.0.49
[#98]: https://github.com/AdguardTeam/DisableAMP/issues/98
[#96]: https://github.com/AdguardTeam/DisableAMP/issues/96
[#100]: https://github.com/AdguardTeam/DisableAMP/issues/100
