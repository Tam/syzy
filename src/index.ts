import { FastifyPluginAsync, FastifyServerOptions } from 'fastify';
import path from 'path';
import fp from 'fastify-plugin';
import { SyzyPluginOptions, SyzyState } from './types';
import FastifyFormBody from '@fastify/formbody';
import FastifyStatic from '@fastify/static';
import TemplatesPlugin from '@/plugins/templates';
import RoutesPlugin from '@/plugins/routes';

export { error, redirect } from '@/plugins/routes/response';

const defaultOptions: SyzyPluginOptions = {
	routesPath: './routes',
	errorsPath: '',
	publicPath: './public',
};

const SyzyPlugin: FastifyPluginAsync<SyzyPluginOptions> = async (fastify, options) => {
	options = {
		...defaultOptions,
		...options,
	};

	const syzyState: SyzyState = {
		routesPath: options.routesPath ?? defaultOptions.routesPath!,
		errorsPath: options.errorsPath ?? defaultOptions.errorsPath!,
	};

	fastify.register(FastifyFormBody);

	fastify.register(FastifyStatic, {
		root: path.join(process.cwd(), options.publicPath ?? defaultOptions.publicPath!),
		dotfiles: 'deny',
		serveDotFiles: false,
	});

	fastify.register(TemplatesPlugin, {
		...(options?.templates ?? {}),
		_state: syzyState,
	});

	fastify.register(RoutesPlugin, {
		_state: syzyState,
	});
};

export default fp(SyzyPlugin, {
	fastify: '5.x',
	name: 'syzy',
});

export const recommendedOptions: FastifyServerOptions = {
	ignoreTrailingSlash: true,
	ignoreDuplicateSlashes: true,
};
