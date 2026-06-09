# adonisjs-mongoose

## 0.2.5

### Patch Changes

- 1a7593b: Releases now ship with a working npm provenance attestation (the CI publish
  writes the `provenance` setting to the npmrc that `pnpm publish` actually
  reads). Verify with `npm audit signatures`.

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
