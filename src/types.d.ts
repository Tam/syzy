import { TemplatePluginOptions } from '@/plugins/templates';
import SyzyResponse from '@/plugins/routes/response';
import { FastifyHelmetOptions } from '@fastify/helmet';
import { RouteShorthandOptions } from 'fastify/types/route';
import { HttpHeader } from 'fastify/types/utils';

type Headers = Partial<Record<HttpHeader, number | string | string[] | undefined>>;
type HandlerResponse = void | { headers?: Headers, [key: string]: any } | SyzyResponse;
type HandlerResponsePromise = Promise<HandlerResponse>;
type Handler = (request: FastifyRequest) => HandlerResponse | HandlerResponsePromise;

/**
 * Options passed to the Twig templating engine.
 */
export interface TemplatePluginOptions {
	/**
	 * Additional namespaces to register with Twig.
	 *
	 * Paths are relative to the ***project root***.
	 *
	 * Syzy comes with a built-in `@/` namespace, which is the same as the ***routes path***.
	 *
	 * @see https://github.com/twigjs/twig.js/wiki#namespaces
	 * @default undefined
	 * @example
	 * {
	 * 	'components': './components'
	 * }
	 */
	namespaces?: Record<string, string>;
}

/**
 * Options used to configure Syzy.
 */
export interface SyzyPluginOptions {
	/**
	 * The path to the routes directory.
	 *
	 * It is relative to the ***project root***.
	 *
	 * @default './routes'
	 */
	routesPath?: string;

	/**
	 * The path to the public directory.
	 *
	 * It is relative to the ***routes path***.
	 *
	 * @default ''
	 */
	errorsPath?: string;

	/**
	 * The path to the public directory.
	 *
	 * It is relative to the ***project root***.
	 *
	 * @default './public'
	 */
	publicPath?: string;

	/**
	 * Options passed to Twig
	 *
	 * @default undefined
	 */
	templates?: TemplatePluginOptions;

	/**
	 * A global handler that is called for every request.
	 *
	 * This is useful for setting up global variables or middleware.
	 *
	 * @default undefined
	 */
	globalHandler?: Handler;

	/**
	 * Options passed to Helmet
	 *
	 * @see https://helmetjs.github.io
	 * @default undefined
	 */
	helmet?: FastifyHelmetOptions;

	/**
	 * Default headers to set on every response.
	 *
	 * @default undefined
	 * @example
	 * {
	 * 	'x-custom-header': 'hello',
	 * 	'x-custom-header-2': 'world'
	 * }
	 */
	headers?: Headers;

	/**
	 * Default cache control header to set on every response.
	 *
	 * TODO: Should we move this into the `headers` option?
	 *
	 * @default 'private, max-age=60'
	 */
	defaultCacheControl?: string;
}

/**
 * # The Route interface
 *
 * In your routes directory, alongside an optional `page.twig` template file,
 * you can have one or more method files. These files should be named after the
 * method you want to handle (i.e. `get.ts`, `post.ts`, etc.).
 *
 * The default export of these method files should be a `Route` object.
 *
 * ## Example
 *
 * ```ts
 * // routes/item/[id]/get.ts
 *
 * import { Route, error } from 'syzy';
 *
 * export default {
 *     handler (request) {
 *         const id = request.params.id;
 *
 *         if (isNaN(id) || +id < 0 || +id > 9)
 *             return error(404);
 *
 *         return {
 *             id,
 *             name: `Item ${id}`,
 *         };
 *     }
 * } as Route;
 * ```
 */
export interface Route {
	/**
	 * Options passed to Fastify's `route` method.
	 *
	 * @see https://fastify.dev/docs/latest/Reference/Routes/#routes-options
	 * @default undefined
	 */
	options?: RouteShorthandOptions,

	/**
	 * Headers to set on the response for this route.
	 *
	 * @default undefined
	 * @example
	 * {
	 * 	'x-custom-header': 'hello',
	 * 	'x-custom-header-2': 'world'
	 * }
	 */
	headers?: Headers;

	/**
	 * The handler for this route.
	 *
	 * TODO: expand this with full examples and docs
	 *
	 * @default undefined
	 */
	handler?: Handler;
}
