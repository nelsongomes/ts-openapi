# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## <sub>v1.1.11</sub>

### Security

* Fixed all 30 security vulnerabilities (12 high, 17 moderate, 1 low)
* Updated axios from 1.12.2 to 1.17.0 (fixed multiple SSRF, DoS, and header injection vulnerabilities)
* Updated lodash from 4.17.21 to 4.18.1 (fixed code injection vulnerability via _.template)
* Updated node-notifier from 8.0.1 to 10.0.1 (fixed uuid buffer bounds check vulnerability)
* Updated release-it from 19.0.4 to 19.2.4 (fixed undici WebSocket and HTTP smuggling vulnerabilities)
* Added pnpm overrides for undici (>=6.24.0) and uuid (>=11.1.1) to enforce secure transitive dependencies

### Changed

* Updated minimum Node.js version from 18 to 24
* Added .npmrc with save-exact=true to enforce exact version locking for future package installations
* All 126 tests passing after security updates

## <sub>v1.1.0</sub>

### Changed

* Added support for arrays in body definition

## <sub>v1.0.2</sub>

### Changed

* Cleaned up code

## <sub>v1.0.1</sub>

### Changed

* Increased code coverage

## <sub>v1.0.0</sub>

### Added

* Support for data models was added
* Support for parameters was added
* Methods can now be marked as deprecated
* OpenApiMingle class was added to support multiple schemas combining check article [Maintaining REST API Documentation with Node.js — Part II](https://medium.com/pipedrive-engineering/maintaining-rest-api-documentation-with-node-js-part-ii-26d1a622d3fe) and you can check for a demo server here: https://github.com/nelsongomes/server/blob/main/src/mingle-demo.ts

### Changed

* *bodySchema* method was replaced with bodySchema *openApi.declareSchema*
* demo service was updated <https://github.com/nelsongomes/server/>

## <sub>v0.3.2</sub>

### Added

* Updated npm engine >=6

## <sub>v0.3.1</sub>

### Added

* This version is not working properly, due to an export bug.

## <sub>v0.3.0</sub>

### Added

* First generally available release.
* Updated documentation.
* Added helpers for security and types.
* First release.
* Decent code coverage > 90%