# adonisjs-mongoose

## 0.3.0

### Minor Changes

- e3b68ac: Rename the published config file from `config/mongo.ts` to `config/mongoose.ts` so it matches the package name, and fix the config stub failing to compile.
  - **Breaking:** the config is now read from `config/mongoose.ts` (the provider resolves `config.get('mongoose')`). Apps upgrading from 0.2.x must rename their existing `config/mongo.ts` to `config/mongoose.ts` — the file's contents are unchanged. The container binding and service (`mongo`) are unchanged.
  - **Fix:** `node ace configure adonisjs-mongoose` no longer throws `SyntaxError: Unexpected identifier 'mongo'`. The config stub's JSDoc comment contained backticks, which terminated the backtick template literal that the stub engine (tempura) wraps body text in. Backticks have been removed from the stub body.

## 0.2.5

### Patch Changes

- Maintenance release: documentation and CI cleanup, no API changes. (npm
  provenance was attempted but reverted — it is not supported by the
  changesets + pnpm publish path used here.)

## 0.2.4

### Patch Changes

- 2d84477: Document npm provenance: releases are published from CI with a provenance
  attestation linking each version to its source commit and build workflow.

## 0.2.3

### Patch Changes

- 137177a: Drop `publishConfig.provenance`. Provenance is now driven by the CI workflow
  (`NPM_CONFIG_PROVENANCE`), so publishing locally no longer fails for lack of
  an OIDC token while CI publishes still carry a provenance attestation.

## 0.2.2

### Patch Changes

- 98dabf9: Publish with npm provenance attestation. Builds published from CI now carry
  a verifiable link back to the source commit and workflow.

## 0.2.1

### Patch Changes

- d9f6132: Add an npm downloads badge to the README.

## 0.2.0

### Minor Changes

- 00179de: Rewrite for AdonisJS v7 with a config-driven, multi-connection manager.
  - New API: `defineConfig`, `defineMongoModel`, and the resolved `mongo` service — replaces the previous `BaseModel` / `services/db` API.
  - Connection-name type safety via the `adonisjs-mongoose/types` module augmentation.
  - `MongoConnectionCheck` health check, the `make:mongo-model` ace command, and REPL bindings.
  - Self-contained tooling (official `@adonisjs` tsconfig/eslint/prettier configs) and a runnable AdonisJS v7 demo in `apps/api`.
  - Requires `@adonisjs/core@^7`, `mongoose@^9`, and Node `>=24`.
