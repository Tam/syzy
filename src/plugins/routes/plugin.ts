import fp from 'fastify-plugin';
import fs from 'fs';
import path from 'path';
import { Route, SyzyStateOptions } from '@/types';
import SyzyResponse from '@/plugins/routes/response';
import { Headers } from '@/types';

const methods = ['get', 'post', 'put', 'delete', 'patch'] as const;
type Method = typeof methods[number];

export default fp<SyzyStateOptions & { headers?: Headers }>(function RoutesPlugin (app, options, done) {
	const basePath = options._state.routesPath.replace(/\/$/, '') + '/';

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
				const actionContext = await handler?.(request) ?? {};
				if (actionContext instanceof SyzyResponse) return actionContext.handle(options._state, request, reply);

				let getContext = {};
				if (method !== 'get') {
					getContext = await actionFiles[routePath].get?.handler?.(request) ?? {};
					if (getContext instanceof SyzyResponse) return getContext.handle(options._state, request, reply);
				}

				const globalContext = await options._state.globalHandler?.(request) ?? {};

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

				const headers = {
					'cache-control': 'private, max-age=60',
					...(options.headers ?? {}),
					...(handlerHeaders ?? {}),
					...('headers' in globalContext ? globalContext.headers as Headers : {}),
					...('headers' in getContext ? getContext.headers as Headers : {}),
					...('headers' in actionContext ? actionContext.headers : {}),
				} as Headers;

				if (templatePath) return reply.headers(headers).viewAsync(templatePath, context);
				else return reply.send(context) // TODO: render error page
			});
		}

		if (templatePath && !('get' in actions)) {
			app.get(route, async (request, reply) => {
				const globalContext = await options._state.globalHandler?.(request) ?? {};

				const context = {
					...globalContext,
					params: request.params,
				};

				const headers = {
					'cache-control': 'private, max-age=60',
					...(options.headers ?? {}),
					...('headers' in globalContext ? globalContext.headers as Headers : {}),
				} as Headers;

				if (templatePath) return reply.headers(headers).viewAsync(templatePath, context);
				else return reply.send(context); // TODO: render error page
			});
		}
	}

	app.setErrorHandler(async (error, request, reply) => {
		if (error.statusCode) {
			const globalContext = await options._state.globalHandler?.(request) ?? {};

			const headers = {
				'cache-control': 'private, max-age=60',
				...(options.headers ?? {}),
				...('headers' in globalContext ? globalContext.headers as Headers : {}),
			} as Headers;

			// TODO: built-in fallback error page
			return reply.code(error.statusCode).headers(headers).viewAsync(
				path.join(options._state.routesPath, options._state.errorsPath, `${error.statusCode}.twig`),
				{
					...globalContext,
					message: error.message,
				},
			);
		}
	});

	app.setNotFoundHandler(async (request, reply) => {
		const globalContext = await options._state.globalHandler?.(request) ?? {};

		const headers = {
				'cache-control': 'private, max-age=60',
				...(options.headers ?? {}),
				...('headers' in globalContext ? globalContext.headers as Headers : {}),
			} as Headers;

		return reply.code(404).headers(headers).viewAsync(
			path.join(options._state.routesPath, options._state.errorsPath, '404.twig'),
			{
				...globalContext,
			},
		);
	});

	done();
});
