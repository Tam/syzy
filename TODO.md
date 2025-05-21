# TODO

## Musts

- [x] Routes without a page file (i.e. just a GET that redirects)
  - [x] Should probably support all method types as stand-alone (so you can post to a page and redirect)
- [x] Static files
- [x] @fastify/helmet
- [ ] Watch routes directory for changes (optional, behind config)
- [x] Helper functions to support redirecting, 404ing, etc. from route handlers
- [x] Error template files (i.e. 404.twig)
- [x] Global context (w/ access to everything regular routes have access to, probably as a special handler in the plugin settings)
- [ ] Hot reloading
- [ ] JWT authentication

## Nice to have

- [x] Better `|json_encode` that supports passing other options to `JSON.stringify`
- [ ] A debug bar (similar to Yii's debug bar)
- [ ] Critical CSS
- [ ] Convert atom plugin to twig js
- [ ] Static file cache-breaking (i.e. style.[hash].css)
- [ ] "Dynamic" routes (i.e. `routes/contact/@form/page.twig` would only contain form code with the idea that it is dynamically included into the parent via HTMX or something, and would automatically redirect to the parent if accessed directly)
- [ ] Twig `css` & `js` tags that will add a style/script tag to the body and automatically add the src/integrity/nonce to CSP
