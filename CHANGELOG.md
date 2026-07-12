# Changelog

## [1.2.2](https://github.com/martadams89/lotto-strategy-hub/compare/v1.2.1...v1.2.2) (2026-07-12)


### Bug Fixes

* **deps:** update dependency lucide-react to v1 ([#28](https://github.com/martadams89/lotto-strategy-hub/issues/28)) ([2925136](https://github.com/martadams89/lotto-strategy-hub/commit/2925136037f470c49568f5984da7c573a8235cb6))

## [1.2.1](https://github.com/martadams89/lotto-strategy-hub/compare/v1.2.0...v1.2.1) (2026-07-10)


### Bug Fixes

* **ci:** route draw-results sync through a PR instead of pushing to main ([#18](https://github.com/martadams89/lotto-strategy-hub/issues/18)) ([81b9f9f](https://github.com/martadams89/lotto-strategy-hub/commit/81b9f9f25b5f0aaa84dcf1c965eb8f1b0af7fb68))

## [1.2.0](https://github.com/martadams89/lotto-strategy-hub/compare/v1.1.0...v1.2.0) (2026-07-07)


### Features

* agent discovery — Web Bot Auth JWKS, Agent Skills index, auth.md, WebMCP ([f502597](https://github.com/martadams89/lotto-strategy-hub/commit/f502597fcf88511a48cc4cc8e090d72a79056fa9))
* Markdown for Agents — Accept: text/markdown content negotiation (Pages Function) ([d78275a](https://github.com/martadams89/lotto-strategy-hub/commit/d78275ab71f9b1f919d61652cf8fc669f3f81c1f))
* MCP server (JSON-RPC) + /.well-known/mcp.json in the agent middleware ([942032d](https://github.com/martadams89/lotto-strategy-hub/commit/942032d8717b0821aa2a4525fe489e84726a45b9))
* **web:** footer link to /agents (human-visible MCP entry point) ([dd87626](https://github.com/martadams89/lotto-strategy-hub/commit/dd87626eb805b1ea1fba54d96764382be31bfa3a))


### Bug Fixes

* add Worker main serving the agent surface (env.ASSETS passthrough) ([d56ec56](https://github.com/martadams89/lotto-strategy-hub/commit/d56ec565c426cac1de97e24b85774ed1fcc75c81))
* auth.md H1 must contain 'auth.md' (isitagentready check) ([147dc1c](https://github.com/martadams89/lotto-strategy-hub/commit/147dc1ca433499a9671b22501941c8f061b0cff0))
* BentoPDF link -&gt; pdf.localedgeconsulting.co.uk (live host) ([6acaa37](https://github.com/martadams89/lotto-strategy-hub/commit/6acaa37547111e60e837a62e68cac6f9b5901b75))
* **ci:** release-please PRs use RENOVATE_TOKEN so CI actually runs ([#17](https://github.com/martadams89/lotto-strategy-hub/issues/17)) ([92416ba](https://github.com/martadams89/lotto-strategy-hub/commit/92416ba74cfa13355e17ac7bc2d7ac559a632cb5))
* serve agent surface from a Worker main (this deploys as Workers, not Pages) ([560f447](https://github.com/martadams89/lotto-strategy-hub/commit/560f447f6990cf970dc7dc653f8b0fae1cfd6778))

## [1.1.0](https://github.com/martadams89/lotto-strategy-hub/compare/v1.0.0...v1.1.0) (2026-07-05)


### Features

* agent-readiness pack + llms.txt/sitemap/robots (new) ([2db7b71](https://github.com/martadams89/lotto-strategy-hub/commit/2db7b71cc61304caeaca7c2bdfd267045e4bd7c6))

## [1.0.0](https://github.com/martadams89/lotto-strategy-hub/compare/v0.1.0...v1.0.0) (2026-07-04)


### ⚠ BREAKING CHANGES

* removes server.ts and the /api endpoints; the app is now a pure static SPA reading public/data. Fabricated winner/jackpot fields are gone.

### Features

* add sum rating explanation to ledger view ([8620b98](https://github.com/martadams89/lotto-strategy-hub/commit/8620b98aaf4ed52ff8213541a52ad03a5c2f022c))
* honest rewrite — day-aware picker, full archive, self-maintaining pipeline ([#3](https://github.com/martadams89/lotto-strategy-hub/issues/3)) ([6665c7f](https://github.com/martadams89/lotto-strategy-hub/commit/6665c7f34b386410a0d9861afc8a17c5c92234c3))
* initialize Lotto Strategy Hub application ([207da3f](https://github.com/martadams89/lotto-strategy-hub/commit/207da3f133ccac8c9d4541c198ecf45b9bb0c948))


### Bug Fixes

* **ci:** pin renovate action to v46.1.17 (v40 didn't exist) ([#5](https://github.com/martadams89/lotto-strategy-hub/issues/5)) ([3b1c9fd](https://github.com/martadams89/lotto-strategy-hub/commit/3b1c9fdf1dfdff3336f97bb4628998557055dda7))
* **deps:** update all non-major dependencies ([#6](https://github.com/martadams89/lotto-strategy-hub/issues/6)) ([c4d3daf](https://github.com/martadams89/lotto-strategy-hub/commit/c4d3daf09dd6cc9de126f550d6e52a6041d6eeaa))
