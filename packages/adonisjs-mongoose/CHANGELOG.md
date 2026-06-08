# adonisjs-mongoose

## 0.2.0

### Minor Changes

- 00179de: Rewrite for AdonisJS v7 with a config-driven, multi-connection manager.
  - New API: `defineConfig`, `defineMongoModel`, and the resolved `mongo` service — replaces the previous `BaseModel` / `services/db` API.
  - Connection-name type safety via the `adonisjs-mongoose/types` module augmentation.
  - `MongoConnectionCheck` health check, the `make:mongo-model` ace command, and REPL bindings.
  - Self-contained tooling (official `@adonisjs` tsconfig/eslint/prettier configs) and a runnable AdonisJS v7 demo in `apps/api`.
  - Requires `@adonisjs/core@^7`, `mongoose@^9`, and Node `>=24`.
