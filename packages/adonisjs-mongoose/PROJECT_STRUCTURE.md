# AdonisJS Mongoose - Project Structure

## Overview

This is a Mongoose provider for AdonisJS 6, similar to Lucid but using Mongoose ODM. It provides multi-connection support, lifecycle management, and a BaseModel for easy model creation.

## Project Structure

```
adonis-mongoose/
├── src/
│   ├── types/
│   │   └── main.ts              # TypeScript type definitions
│   ├── connection/
│   │   ├── index.ts             # Connection class (manages single mongoose connection)
│   │   └── manager.ts           # ConnectionManager (manages multiple connections)
│   ├── database/
│   │   └── main.ts              # Database service class
│   ├── model/
│   │   └── base_model.ts        # BaseModel for all mongoose models
│   └── define_config.ts         # Config helper function
├── providers/
│   └── mongoose_provider.ts     # AdonisJS service provider
├── services/
│   └── mongoose_service.ts      # Service export for DI
├── stubs/
│   ├── main.ts                  # Stubs root path
│   └── config/
│       └── database.stub        # Database config template
├── examples/
│   └── usage.ts                 # Usage examples
├── configure.ts                 # Package configuration script
├── index.ts                     # Main package entry point
├── package.json
├── tsconfig.json
├── LICENSE
├── README.md
├── USAGE.md
└── .env.example
```

## Key Features Implemented

### 1. Multi-Connection Support ✅

- Define multiple MongoDB connections in config
- Switch between connections using `static connection` in models
- Default connection support
- Connection pooling and lifecycle management

### 2. Configuration System ✅

- Similar to Lucid's `defineConfig` pattern
- Support for both connection URI and individual options
- Environment variable integration
- Type-safe configuration

### 3. Connection Management ✅

- **Connection class**: Manages single mongoose connection
  - Event monitoring (connected, disconnected, error)
  - Connection state tracking
  - Automatic reconnection
  - Proper cleanup

- **ConnectionManager class**: Manages multiple connections
  - Lazy connection (connects when first used)
  - Connection registry
  - Orphan connection cleanup
  - Proper shutdown handling

### 4. Database Service ✅

- Central database access point
- Connection retrieval
- Manager integration
- Macroable support for extensibility

### 5. BaseModel ✅

- Similar to Lucid BaseModel
- Automatic connection management
- Model caching for performance
- Proxy to all Mongoose model methods
- Connection switching per model
- Custom collection naming

### 6. Provider Integration ✅

- Proper AdonisJS lifecycle hooks:
  - `register()`: Container bindings
  - `boot()`: Setup BaseModel
  - `start()`: Optional early connection
  - `ready()`: Post-boot hook
  - `shutdown()`: Close all connections
- Event emission for monitoring
- Development mode logging

### 7. Environment Variables ✅

- `DEFAULT_MONGODB_CONNECTION`: Default connection name
- `MONGODB_URI`: Connection URI (takes precedence)
- `MONGODB_HOST`, `MONGODB_PORT`, etc.: Individual options
- Support for multiple connection env vars
- Validation through env schema

### 8. Type Safety ✅

- Full TypeScript support
- Type definitions for all contracts
- Declaration module augmentation
- IntelliSense support

## How It Works

### Connection Flow

1. **Configuration Phase**
   - User defines connections in `config/database.ts`
   - Provider registers Database service in container

2. **Boot Phase**
   - Provider injects Database instance into BaseModel
   - Event listeners are setup

3. **Runtime Phase**
   - Model methods trigger connection on-demand
   - ConnectionManager creates Connection instances
   - Connections are cached and reused

4. **Shutdown Phase**
   - Provider closes all connections gracefully
   - Cleanup orphan connections

### Model Usage Flow

```typescript
// 1. Define model
export class User extends BaseModel {
  static connection = 'mongodb' // optional
  static schema = new Schema({
    /* ... */
  })
}

// 2. Use model
const user = await User.create({
  /* ... */
})

// What happens internally:
// - User.create() calls User.getModel()
// - getModel() calls User.getConnection()
// - getConnection() calls $db.connection('mongodb')
// - Database checks if connection exists
// - ConnectionManager connects if needed
// - Returns native mongoose connection
// - Model is compiled and cached
// - Mongoose create() is executed
```

## Architecture Decisions

### 1. Lazy Connection

Connections are not established at boot time, but when first accessed. This:

- Reduces startup time
- Prevents unnecessary connections
- Follows Lucid's pattern

### 2. Model Caching

Compiled mongoose models are cached per connection to avoid recompilation:

- Key format: `connectionName:ModelName`
- Improves performance
- Can be cleared for testing

### 3. Event-Based Monitoring

Connection lifecycle emits events for:

- Logging and debugging
- Error tracking
- Custom monitoring integration

### 4. Macroable Pattern

Database class extends Macroable allowing users to add custom methods at runtime

### 5. Native Mongoose API

BaseModel proxies all mongoose methods instead of creating wrappers, ensuring:

- Full mongoose feature support
- No learning curve for mongoose users
- Easy updates when mongoose changes

## Configuration Examples

### Single Connection

```typescript
defineConfig({
  connection: 'mongodb',
  connections: {
    mongodb: {
      uri: env.get('MONGODB_URI'),
    },
  },
})
```

### Multiple Connections

```typescript
defineConfig({
  connection: 'mongodb',
  connections: {
    mongodb: {
      uri: env.get('MONGODB_URI'),
    },
    mongodb_logs: {
      uri: env.get('MONGODB_LOGS_URI'),
    },
    mongodb_analytics: {
      connection: {
        host: env.get('ANALYTICS_HOST'),
        port: env.get('ANALYTICS_PORT'),
        database: 'analytics',
      },
    },
  },
})
```

## Next Steps (Future Enhancements)

1. **Seeders** (mentioned by user to do later)
   - Create seeder base class
   - Seeder runner
   - Ace commands for seeding

2. **Commands**
   - `make:model` - Generate model files
   - `db:seed` - Run seeders
   - `list:connections` - Show all connections

3. **Testing Utilities**
   - Test database helper
   - Automatic cleanup
   - Factory support

4. **Migration Support** (optional)
   - While mongoose doesn't need migrations for schema
   - Could be useful for data migrations

5. **Query Logger**
   - Debug query logging
   - Performance monitoring

## Dependencies

### Production

- `mongoose`: ^8.9.4 - MongoDB ODM
- `@poppinss/macroable`: ^1.0.2 - Macroable support
- `@poppinss/utils`: ^6.8.3 - Utilities

### Peer

- `@adonisjs/core`: ^6.2.0 - AdonisJS framework

### Development

- TypeScript, ESLint, Prettier
- AdonisJS tooling (assembler, tsconfig)

## Usage Summary

```typescript
// 1. Install
npm install adonisjs-mongoose mongoose

// 2. Configure
node ace configure adonisjs-mongoose

// 3. Create Model
export class User extends BaseModel {
  static schema = new Schema({ name: String })
}

// 4. Use Model
const user = await User.create({ name: 'John' })
const users = await User.find()

// 5. Direct Access (if needed)
import db from '@adonisjs/core/services/mongoose'
const connection = db.connection()
```

## Review Checklist

- ✅ Package.json with correct dependencies
- ✅ TypeScript configuration
- ✅ Type definitions for all contracts
- ✅ Connection class with event handling
- ✅ ConnectionManager with lifecycle management
- ✅ Database service with connection access
- ✅ BaseModel with mongoose method proxying
- ✅ Provider with proper lifecycle hooks
- ✅ Configure script for package setup
- ✅ Config stub for user setup
- ✅ Service export for DI
- ✅ Environment variable support
- ✅ Multi-connection support
- ✅ Documentation (README, USAGE)
- ✅ Examples
- ✅ License

## Ready for Review!

All core features are implemented. You can now:

1. Review the code structure
2. Test the connection management
3. Try multi-connection setup
4. Check environment variable handling
5. Test BaseModel functionality

Let me know if you'd like any adjustments or if we should proceed with seeders and commands!
