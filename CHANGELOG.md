# Disable AMP Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog], and this project adheres to [Semantic Versioning].

[Keep a Changelog]: https://keepachangelog.com/en/1.0.0/
[Semantic Versioning]: https://semver.org/spec/v2.0.0.html

## [1.0.59] - 2024-11-26

### Added

- Removing `amp` query parameter from the canonical link [#107].

[1.0.59]: https://github.com/AdguardTeam/DisableAMP/compare/v1.0.58...v1.0.59
[#107]: https://github.com/AdguardTeam/DisableAMP/issues/107

## [1.0.58] - 2024-11-19

### Added

- `/NewsViewAmp/` pattern for AMP pages [#105].
- `amp_articleshow` pattern for AMP pages [#106].

[1.0.58]: https://github.com/AdguardTeam/DisableAMP/compare/v1.0.56...v1.0.58
[#105]: https://github.com/AdguardTeam/DisableAMP/issues/105
[#106]: https://github.com/AdguardTeam/DisableAMP/issues/106

## [1.0.56] - 2024-11-13

### Fixed

- Force to open google image links in new tab [#104].

[1.0.56]: https://github.com/AdguardTeam/DisableAMP/compare/v1.0.54...v1.0.56
[#104]: https://github.com/AdguardTeam/DisableAMP/issues/104

## [1.0.54] - 2024-11-06

### Fixed

- Redirect on Turbo pages [#58].

[1.0.54]: https://github.com/AdguardTeam/DisableAMP/compare/v1.0.52...v1.0.54
[#58]: https://github.com/AdguardTeam/DisableAMP/issues/58

## [1.0.52] - 2024-10-28

### Added

- AMP handling on WordPress sites.

### Fixed

- Infinite reloading on innogyan.in [#103].

[1.0.52]: https://github.com/AdguardTeam/DisableAMP/compare/v1.0.51...v1.0.52
[#103]: https://github.com/AdguardTeam/DisableAMP/issues/103

## [1.0.51] - 2024-10-24

### Added

- `cleanAmpLink` function, that forces to open google news link in new tab, necessary for proper redirection. [#102].

### Fixed

- Link breakage due to deletion of amp string. [#102].

[1.0.51]: https://github.com/AdguardTeam/DisableAMP/compare/v1.0.49...v1.0.51
[#102]: https://github.com/AdguardTeam/DisableAMP/issues/102

## [1.0.49] - 2024-10-18

### Added

- Redirect to canonical website for `amppoject` pages [#98], [#96], [#100].

[1.0.49]: https://github.com/AdguardTeam/DisableAMP/compare/v1.0.47...v1.0.49
[#98]: https://github.com/AdguardTeam/DisableAMP/issues/98
[#96]: https://github.com/AdguardTeam/DisableAMP/issues/96
[#100]: https://github.com/AdguardTeam/DisableAMP/issues/100
