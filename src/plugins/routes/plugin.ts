import fp from 'fastify-plugin';
import fs from 'fs';
import path from 'path';
import { Route } from '@/types';
import SyzyResponse from '@/plugins/routes/response';
import { Headers } from '@/types';
import { SyzyPluginOptionsWithDefaults } from '@/index';

const IS_DEV = process.env.NODE_ENV === 'dev';

const methods = ['get', 'post', 'put', 'delete', 'patch'] as const;
type Method = typeof methods[number];

export default fp<SyzyPluginOptionsWithDefaults>(function RoutesPlugin (app, options, done) {
	const basePath = options.routesPath.replace(/\/$/, '') + '/';

	const routeOrigins = new Set<string>();

	// Template routes
	const templateFiles: Record<string, string> = {};
	fs.globSync(`${basePath}**/page.twig`).forEach(file => {
		const p = file
			.replace(basePath, '')
			.replace(/page\.twig$/, '')
			.replace(/\/$/, '');

		templateFiles[p] = file;

		routeOrigins.add(p);
	});

	// Action routes
	const actionFiles: Record<string, Partial<Record<Method, Route>>> = {};
	fs.globSync(`${basePath}**/{${methods.join(',')}}.{ts,js}`).forEach(file => {
		const name = path.basename(file);
		const method = name.replace(/\.(ts|js)$/, '') as Method;
		const p = file
			.replace(basePath, '')
			.replace(new RegExp(`${name}$`), '')
			.replace(/\/$/, '');

		if (!actionFiles[p]) actionFiles[p] = {};
		actionFiles[p][method] = require(path.join(process.cwd(), file)).default as Route;

		routeOrigins.add(p);
	});

	for (const routePath of routeOrigins) {
		const route = '/' + routePath.replace(/\[(.*)]/g, ':$1');
		const templatePath = templateFiles[routePath];
		const actions = actionFiles[routePath] ?? {};

		for (const method in actions) {
			const { options: handlerOpts, handler, headers: handlerHeaders } = actionFiles[routePath][method as Method] as Route;

			const opts = {
				attachValidation: true,
				...handlerOpts,
			};

			app[method as Method](route, opts, async (request, reply) => {
				// TODO: I think it might be nicer to allow the user to access `reply` in their handler directly. That
				//  way they have access to all the useful helpers (`.preventCache()` for example). They'd need to
				//  return it so we have access to it. It'll mean they can end the request early so we'll need to
				//  account for that. We'd also need a custom `.context({})` method so they can set the context they
				//  want passed to the template. It'd also mean we can stop allowing headers to be passed in the context
				//  and instead require users to use `.headers({})` on the reply. That means context can be exclusively
				//  used for template data.

				const actionContext = await handler?.(request) ?? {};
				if (actionContext instanceof SyzyResponse) return actionContext.handle(reply);

				let getContext = {};
				if (method !== 'get') {
					getContext = await actionFiles[routePath].get?.handler?.(request) ?? {};
					if (getContext instanceof SyzyResponse) return getContext.handle(reply);
				}

				const globalContext = await options.globalHandler?.(request) ?? {};
				if (globalContext instanceof SyzyResponse) return globalContext.handle(reply);

				if (!templatePath) return reply.notImplemented('No template found for this route');

				const context = {
					...globalContext,
					...getContext,
					...actionContext,
					validationErrors: request.validationError?.validation?.reduce((a: Record<string, string>, b: any) => {
						const name = b.instancePath.replace('/', '');
						a[name] = `${name} ${b.message}`;

						return a;
					}, {} as Record<string, string>),
					body: request.body,
					params: request.params,
				};

				delete context.headers;

				const headers = {
					'cache-control': options.defaultCacheControl,
					...(options.headers ?? {}),
					...(handlerHeaders ?? {}),
					...('headers' in globalContext ? globalContext.headers as Headers : {}),
					...('headers' in getContext ? getContext.headers as Headers : {}),
					...('headers' in actionContext ? actionContext.headers : {}),
				} as Headers;

				return reply.headers(headers).viewAsync(templatePath, context);
			});
		}

		if (templatePath && !('get' in actions)) {
			app.get(route, async (request, reply) => {
				const globalContext = await options.globalHandler?.(request) ?? {};
				if (globalContext instanceof SyzyResponse) return globalContext.handle(reply);

				const context = {
					...globalContext,
					params: request.params,
				};

				delete context.headers;

				const headers = {
					'cache-control': options.defaultCacheControl,
					...(options.headers ?? {}),
					...('headers' in globalContext ? globalContext.headers as Headers : {}),
				} as Headers;

				return reply.headers(headers).viewAsync(templatePath, context);
			});
		}
	}

	app.setErrorHandler(async (error, request, reply) => {
		if (error.statusCode) {
			const globalContext = await options.globalHandler?.(request) ?? {};

			const headers = {
				...(options.headers ?? {}),
				...('headers' in globalContext ? globalContext.headers as Headers : {}),
			} as Headers;

			const resp = reply
				.code(error.statusCode)
				.headers(headers);

			const templatePath = path.join(options.routesPath, options.errorsPath, `${error.statusCode}.twig`);
			if (fs.existsSync(templatePath)) {
				return resp.viewAsync(templatePath, {
					...globalContext,
					message: error.message,
				});
			}

			if (IS_DEV)
				console.error(error);

			return resp
				.header('content-type', 'text/html')
				.preventCache()
				.send(ERROR_PAGE(error.statusCode, error.message));
		}
	});

	app.setNotFoundHandler(async (request, reply) => {
		const globalContext = await options.globalHandler?.(request) ?? {};

		const headers = {
			...(options.headers ?? {}),
			...('headers' in globalContext ? globalContext.headers as Headers : {}),
		} as Headers;

		const resp = reply.code(404).headers(headers).preventCache();

		const templatePath = path.join(options.routesPath, options.errorsPath, '404.twig');
		if (fs.existsSync(templatePath)) {
			return resp.viewAsync(templatePath, {
				...globalContext,
			});
		}

		return resp
			.header('content-type', 'text/html')
			.send(ERROR_PAGE(404, 'Page not found'));
	});

	done();
});

const ERROR_PAGE = (code: string|number, message: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Something went wrong</title>
  <style>
    body {
      font-family: sans-serif;
      background-color: #121212;
      color: #e0e0e0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      inset: 20px;
    }
    .error-container {
      text-align: center;
      max-width: 600px;
    }
    .error-title {
      font-size: 2rem;
      color: #ff5252;
      margin-bottom: 1rem;
    }
    .error-message {
      font-size: 1.2rem;
      margin-bottom: 1.5rem;
    }
    .error-code {
      background-color: #1e1e1e;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-family: monospace;
      display: inline-block;
    }
  </style>
</head>
<body>
  <div class="error-container">
    <h1 class="error-title">Oops! Something went wrong</h1>
    <p class="error-message">We're sorry, we encountered an error while processing your request.</p>
    <div class="error-code">Error ${code}: ${message}</div>
  </div>
</body>
</html>
`;
