# Demo API — `adonisjs-mongoose`

A minimal **AdonisJS v7** app that demonstrates every feature of
[`adonisjs-mongoose`](../../packages/adonisjs-mongoose). It consumes the package
through the workspace (`adonisjs-mongoose: workspace:*`).

## What it shows

| Feature | Where |
|---|---|
| Multiple connections + type augmentation | [`config/mongoose.ts`](./config/mongoose.ts) |
| Service alias re-export | [`app/services/mongo.ts`](./app/services/mongo.ts) |
| Model on the **default** connection | [`app/models/mongo/user.ts`](./app/models/mongo/user.ts) |
| Model on a **named** connection | [`app/models/mongo/event.ts`](./app/models/mongo/event.ts) |
| CRUD controller | [`app/controllers/users_controller.ts`](./app/controllers/users_controller.ts) |
| Health check | [`start/health.ts`](./start/health.ts) |
| Multi-connection isolation | [`start/routes.ts`](./start/routes.ts) |

## Run it

```sh
# 1. Start a MongoDB (any instance works)
docker run -d -p 27017:27017 mongo:7

# 2. Configure env
cp .env.example .env   # then set APP_KEY (node ace generate:key)

# 3. From the repo root
pnpm install
pnpm --filter adonisjs-mongoose build   # build the package first
pnpm --filter api dev
```

The server starts on <http://localhost:3333>.

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Lists the demo endpoints |
| `GET` | `/health` | Runs a `MongoConnectionCheck` per connection |
| `GET` | `/api/users` | List users (default connection) |
| `POST` | `/api/users` | Create a user — `{ "name", "email" }` |
| `GET` | `/api/users/:id` | Fetch a user |
| `PUT` | `/api/users/:id` | Update a user |
| `DELETE` | `/api/users/:id` | Delete a user |
| `GET` | `/api/demo/multi-connection` | Writes to `analytics`, reports both databases and `isolated: true` |

```sh
curl -X POST localhost:3333/api/users -H 'content-type: application/json' \
  -d '{"name":"Ada Lovelace","email":"ada@example.com"}'

curl localhost:3333/api/demo/multi-connection
# { "primary": { "database": "demo_primary", "users": 1 },
#   "analytics": { "database": "demo_analytics", "events": 1 },
#   "isolated": true }
```

## Scaffold a model

```sh
node ace make:mongo-model order --connection=analytics
```
