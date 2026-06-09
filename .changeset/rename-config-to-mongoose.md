---
'adonisjs-mongoose': minor
---

Rename the published config file from `config/mongo.ts` to `config/mongoose.ts` so it matches the package name, and fix the config stub failing to compile.

- **Breaking:** the config is now read from `config/mongoose.ts` (the provider resolves `config.get('mongoose')`). Apps upgrading from 0.2.x must rename their existing `config/mongo.ts` to `config/mongoose.ts` — the file's contents are unchanged. The container binding and service (`mongo`) are unchanged.
- **Fix:** `node ace configure adonisjs-mongoose` no longer throws `SyntaxError: Unexpected identifier 'mongo'`. The config stub's JSDoc comment contained backticks, which terminated the backtick template literal that the stub engine (tempura) wraps body text in. Backticks have been removed from the stub body.
