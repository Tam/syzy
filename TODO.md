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
- [ ] Static file cache-breaking (i.e. style.[hash].css)
  - [ ] It would be nice if this integrated with the `css`/`js` tags and inject the hash, based on last updated, automatically (and redirect to the real file correctly)
- [ ] "Dynamic" routes (i.e. `routes/contact/@form/page.twig` would only contain form code with the idea that it is dynamically included into the parent via HTMX or something, and would automatically redirect to the parent if accessed directly) Can also be used for pagination or infinite scroll loading
  - [ ] Might also be nice to support `{% fragment 'name' %}` blocks that can be used in a similar way (so only the fragment is rendered on certain requests) that works similar to [template fragments](https://htmx.org/essays/template-fragments/)
- [ ] Twig `css` & `js` tags that will add a style/script tag to the body and automatically add the src/integrity/nonce to CSP
- [ ] Convert atom plugin to twig js
- [ ] `middleware.ts` files that are run before all sibling and child routes in order of nearest first
  - So `item/edit/middleware.ts` will run before `item/middleware.ts` for `item/edit/post.ts`

## Nice to have

- [x] Better `|json_encode` that supports passing other options to `JSON.stringify`
- [ ] A debug bar (similar to Yii's debug bar)
- [ ] Critical CSS
- [ ] Generated docs via TypeDoc or something
- [ ] Support twig import paths without the `.twig` extension (i.e. `{% extends '@/layout' %}`)
- [ ] Show twig errors in browser, not just a white page and the error in the server log

## Ideas
- [ ] "Modal" routes (i.e. `routes/items/?edit/page.twig` that will inject the contents of the page into the parent page at the end of the body if the matching query param (`?edit=123`) is found)
- [ ] An `{% async %}` block for streaming HTML ([see](https://lamplightdev.com/blog/2024/01/10/streaming-html-out-of-order-without-javascript/))
