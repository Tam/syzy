import fp from 'fastify-plugin';
import fs from 'fs';
import path from 'path';
import { Route, SyzyStateOptions } from '@/types';
import { RouteShorthandOptions } from 'fastify/types/route';
import SyzyResponse from '@/plugins/routes/response';

const methods = ['get', 'post', 'put', 'delete', 'patch'] as const;
type Method = typeof methods[number];

export default fp<SyzyStateOptions>(function RoutesPlugin (app, options, done) {
	const routesPath = options._state.routesPath.replace(/\/$/, '') + '/';

	const routeOrigins = new Set<string>();

	// Template routes
	const templateFiles = fs.globSync(`${routesPath}**/page.twig`);
	templateFiles.forEach(file => {
		const p = file
			.replace(routesPath, '')
			.replace('page.twig', '')
			.replace(/\/$/, '');

		routeOrigins.add(p);
	});

	// Get routes
	const getFiles = fs.globSync(`${routesPath}**/get.{ts,js}`);
	getFiles.forEach(file => {
		const p = file
			.replace(routesPath, '')
			.replace(/get\.(ts|js)$/, '')
			.replace(/\/$/, '');

		routeOrigins.add(p);
	});

	for (const routePath of routeOrigins) {
		const route = '/' + routePath.replace(/\[(.*)]/g, ':$1');
		const dirPath = path.join(routesPath, routePath);

		const templatePath = path.join(dirPath, 'page.twig');
		const templateExists = fs.existsSync(templatePath);

		const handlersGlob = path.join(dirPath, `{${methods.join(',')}}.{ts,js}`);
		const handlers = fs.globSync(handlersGlob).reduce((a, b) => {
			const name = path.basename(b).replace(/\.(ts|js)$/, '') as Method;
            a[name] = require(path.join(process.cwd(), b)).default as Route;

			return a;
		}, {} as Record<Method, Route | undefined>);

		for (const key of methods) {
			if (key === 'get') continue;

			const opts = {
				attachValidation: true,
				...(handlers[key]?.options ?? {}),
			} as RouteShorthandOptions;

			app[key](route, opts, async (request, reply) => {
				const actionContext = await handlers[key]?.handler?.(request) ?? {};
				if (actionContext instanceof SyzyResponse) return actionContext.handle(options._state, request, reply);

				const getContext = await handlers.get?.handler?.(request) ?? {};
				if (getContext instanceof SyzyResponse) return getContext.handle(options._state, request, reply);

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
				} as Record<string, any>;

				if (templateExists) return reply.viewAsync(templatePath, context);
				else return reply.send(context) // TODO: render error page
			});
		}

		app.get(route, handlers?.get?.options ?? {}, async (request, reply) => {
			const context = await handlers.get?.handler?.(request) ?? {};
			if (context instanceof SyzyResponse) return context.handle(options._state, request, reply);

			const globalContext = await options._state.globalHandler?.(request) ?? {};

			if (templateExists) return reply.viewAsync(templatePath, {
				...globalContext,
				...context,
				params: request.params,
			});
			else return reply.send(context); // TODO: render error page
		});
	}

	app.setErrorHandler(async (error, request, reply) => {
		if (error.statusCode) {
			const globalContext = await options._state.globalHandler?.(request) ?? {};

			// TODO: built-in fallback error page
			return reply.code(error.statusCode).viewAsync(
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

		return reply.code(404).viewAsync(
			path.join(options._state.routesPath, options._state.errorsPath, '404.twig'),
			{
				...globalContext,
			},
		);
	});

	done();
});
