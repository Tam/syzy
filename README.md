# Syzy

A Fastify plugin for [brief description of what your plugin does].

## Installation

```bash
# Using npm
npm install syzy

# Using yarn
yarn add syzy

# Using pnpm
pnpm add syzy

# Using bun
bun add syzy
```

## Usage

```typescript
import Fastify from 'fastify';
import SyzyPlugin, { recommendedOptions } from 'syzy';

const fastify = Fastify(recommendedOptions);

// Register the plugin
await fastify.register(SyzyPlugin, {
  // options
});

await fastify.listen({ port: 3000 });
```

## API

### Plugin Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `prefix` | `string` | `'syzy'` | Prefix for the plugin's routes |

## Development

This project uses [Bun](https://bun.sh) for development and building.

```bash
# Install dependencies
bun install

# Run the development server (with auto-restart)
bun dev

# Run tests
bun test

# Build the project
bun run build
```

## License

MIT
