# adonisjs-mongoose

[![npm version](https://img.shields.io/npm/v/adonisjs-mongoose.svg?logo=npm)](https://www.npmjs.com/package/adonisjs-mongoose)
[![license](https://img.shields.io/npm/l/adonisjs-mongoose.svg)](./packages/adonisjs-mongoose/LICENSE)

Mongoose ODM integration for **AdonisJS v7** — config-driven multiple
connections, a container-managed manager, a type-safe model factory, an ace
command, REPL bindings and a health check.

This is a pnpm + Turborepo monorepo:

| Package | Description |
|---|---|
| [`packages/adonisjs-mongoose`](./packages/adonisjs-mongoose) | The published npm package. **[Read the docs →](./packages/adonisjs-mongoose/README.md)** |
| [`apps/api`](./apps/api) | A runnable AdonisJS v7 demo using the package. **[Read the guide →](./apps/api/README.md)** |

## Quick start

```sh
pnpm install
pnpm build                              # build the package via Turborepo

# run the demo (needs a MongoDB on :27017)
docker run -d -p 27017:27017 mongo:7
cp apps/api/.env.example apps/api/.env  # set APP_KEY
pnpm --filter api dev                   # http://localhost:3333
```

## Scripts

| Command | Description |
|---|---|
| `pnpm build` | Build all packages |
| `pnpm check-types` | Type-check all packages |
| `pnpm lint` | Lint all packages |
| `pnpm publish-package` | Publish via Changesets |

## Releasing

The package is versioned with [Changesets](https://github.com/changesets/changesets):

```sh
pnpm changeset            # describe a change (creates a changeset)
pnpm changeset version    # apply changesets → bump version + write CHANGELOG
pnpm publish-package      # build + publish to npm
```

## License

[MIT](./packages/adonisjs-mongoose/LICENSE) © Najmus Sakib
