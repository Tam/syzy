# Syzy

Opinionated, automated routing and templating for Fastify

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

Setup your fastify server with the recommended options (exported from Syzy) and 
register the Syzy plugin.

```typescript
// index.ts

import Fastify from 'fastify';
import SyzyPlugin, { recommendedOptions } from 'syzy';

const fastify = Fastify(recommendedOptions);

// Register the plugin
await fastify.register(SyzyPlugin, {
  // options
});

await fastify.listen({ port: 3000 });
```

Add some routes to your `app` directory (customisable in the plugin options).

```
├── src
│   ├── index.ts            # Your fastify server code
├── app
│   ├── page.twig           # Template for /
│   ├── blog
│   │   ├── page.twig       # Template for /blog
│   │   ├── get.ts          # Load data for /blog
│   │   ├── [id]            # Dynamic segment available in `request.params.id`
│   │   │   ├── page.twig   # Template for /blog/123
│   │   │   ├── get.ts      # Load data for /blog/123
│   ├── login
│   │   ├── page.twig       # Template for /login
│   │   ├── post.ts         # Handle post method for /login
├── public                  # Static files
│   ├── styles.css
```

#### Twig

Twig templates come with a default `@` namespace that points to the root of your 
`app` directory: `{% include '@/layout.twig' %}`.

#### Method Handlers

Method handlers should have a default exported `Route` object (see typescript 
types).

`hander` functions should return an object that will be available in the 
template or return a response helper (`error(404)`, `redirect('/')`, etc.).

## API

### Plugin Options

| Option       | Type                    | Default      | Description                                                   |
|--------------|-------------------------|--------------|---------------------------------------------------------------|
| `routesPath` | `string`                | `'./app'`    | Path to your routes directory                                 |
| `errorsPath` | `string`                | `'./'`       | Path to the error templates relative to your routes directory |
| `publicPath` | `string`                | `'./public'` | Path to the public files directory                            |
| `templates`  | `TemplatePluginOptions` | `undefined`  | Twig template options                                         |

#### `TemplatePluginOptions`

| Option       | Type                     | Default | Description     |
|--------------|--------------------------|---------|-----------------|
| `namespaces` | `Record<string, string>` | `{}`    | Twig namespaces |

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
