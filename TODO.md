# TODO

## Musts

- [ ] Routes without a page file (i.e. just a GET that redirects)
- [x] Static files
- [x] @fastify/helmet
- [ ] Watch routes directory for changes (optional, behind config)
- [x] Helper functions to support redirecting, 404ing, etc. from route handlers
- [x] Error template files (i.e. 404.twig)
- [x] Global context (w/ access to everything regular routes have access to, probably as a special handler in the plugin settings)
- [ ] Hot reloading

## Nice to have

- [x] Better `|json_encode` that supports passing other options to `JSON.stringify`
- [ ] A debug bar (similar to Yii's debug bar)
- [ ] Critical CSS
- [ ] Convert atom plugin to twig js
- [ ] Static file cache-breaking (i.e. style.[hash].css)
