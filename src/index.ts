import { FastifyPluginAsync, FastifyServerOptions } from 'fastify';
import path from 'path';
import fp from 'fastify-plugin';
import { SyzyPluginOptions, SyzyState } from './types';
import FastifySensible from '@fastify/sensible';
import FastifyFormBody from '@fastify/formbody';
import FastifyStatic from '@fastify/static';
import FastifyHelmet from '@fastify/helmet';
import helmet from 'helmet';
import TemplatesPlugin from '@/plugins/templates';
import RoutesPlugin from '@/plugins/routes';
import mergeHelmetConfig from '@/util/mergeHelmetConfig';

export { error, redirect } from '@/plugins/routes/response';

const defaultOptions: SyzyPluginOptions = {
	routesPath: './routes',
	errorsPath: '',
	publicPath: './public',
	defaultCacheControl: 'private, max-age=60',
};

const SyzyPlugin: FastifyPluginAsync<SyzyPluginOptions> = async (fastify, options) => {
	options = {
		...defaultOptions,
		...options,
	};

	const syzyState: SyzyState = {
		routesPath: options.routesPath ?? defaultOptions.routesPath!,
		errorsPath: options.errorsPath ?? defaultOptions.errorsPath!,
		globalHandler: options.globalHandler,
	};

	fastify.register(FastifySensible);
	fastify.register(FastifyFormBody);

	const userHelmetOptions = options.helmet ?? {};
	const useDefaultCSP = userHelmetOptions.contentSecurityPolicy === true
		|| (userHelmetOptions.contentSecurityPolicy !== false
		&& userHelmetOptions.contentSecurityPolicy?.useDefaults !== false);
	const defaultDirectives = helmet.contentSecurityPolicy.getDefaultDirectives();
	if (process.env.NODE_ENV === 'dev') delete defaultDirectives['upgrade-insecure-requests'];
	fastify.register(FastifyHelmet, mergeHelmetConfig({
		contentSecurityPolicy: useDefaultCSP ? {
			useDefaults: false,
			directives: defaultDirectives,
		} : void 0,
	}, userHelmetOptions));

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
		headers: options.headers ?? {},
		defaultCacheControl: options.defaultCacheControl ?? defaultOptions.defaultCacheControl!,
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
