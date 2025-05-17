import fp from 'fastify-plugin';
import fs from 'fs';
import path from 'path';
import { Route, SyzyStateOptions } from '@/types';
import { RouteShorthandOptions } from 'fastify/types/route';
import SyzyResponse from '@/plugins/routes/response';

const methods = ['get', 'post', 'put', 'delete', 'patch'] as const;
type Method = typeof methods[number];

// TODO: handle routes without pages (i.e. a GET that immediately redirects, a logout route for example)

export default fp<SyzyStateOptions>(function RoutesPlugin (app, options, done) {
	const routesPath = options._state.routesPath.replace(/\/$/, '') + '/';
	const pagePaths = fs.globSync(`${routesPath}**/page.twig`);

	for (const template of pagePaths) {
		const route = '/' + template
			.replace(routesPath, '')
			.replace('page.twig', '')
			.replace(/\/$/, '')
			.replace(/\[(.*)]/g, ':$1');

		const handlersGlob = template
			.replace(/\[/g, '\\[')
			.replace('page.twig', `{${methods.join(',')}}.{ts,js}`);

		const handlers = fs
			.globSync(handlersGlob)
			.reduce((a, b) => {
				const name = path.basename(b).replace('.ts', '') as Method;
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

				const context = {
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

				return reply.viewAsync(template, context);
			});
		}

		app.get(route, handlers?.get?.options ?? {}, async (request, reply) => {
			const context = await handlers.get?.handler?.(request) ?? {};
			if (context instanceof SyzyResponse) return context.handle(options._state, request, reply);

			context.params = request.params;

			return reply.viewAsync(template, context);
		});
	}

	app.setErrorHandler((error, request, reply) => {
		if (error.statusCode) {
			// TODO: include global state
			return reply.code(error.statusCode).viewAsync(
				path.join(options._state.routesPath, options._state.errorsPath, `${error.statusCode}.twig`),
				{ message: error.message },
			);
		}
	});

	app.setNotFoundHandler((request, reply) => {
		// TODO: include global state
		return reply.code(404).viewAsync(
			path.join(options._state.routesPath, options._state.errorsPath, '404.twig'),
			{},
		);
	});

	done();
});
