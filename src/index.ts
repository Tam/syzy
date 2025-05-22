import { FastifyServerOptions } from 'fastify';
import path from 'path';
import fp from 'fastify-plugin';
import { SyzyPluginOptions } from './types';
import FastifySensible from '@fastify/sensible';
import FastifyFormBody from '@fastify/formbody';
import FastifyStatic from '@fastify/static';
import FastifyHelmet from '@fastify/helmet';
import TemplatesPlugin from '@/plugins/templates';
import RoutesPlugin from '@/plugins/routes';
import buildHelmetConfig from '@/util/buildHelmetConfig';

export { error, redirect } from '@/plugins/routes/response';

const defaultOptions: SyzyPluginOptions = {
	routesPath: './routes',
	errorsPath: '',
	publicPath: './public',
	defaultCacheControl: 'private, max-age=60',
	helmet: {},
};

type RequiredOptionKeys = keyof typeof defaultOptions;

export type SyzyPluginOptionsWithDefaults =
	Omit<SyzyPluginOptions, RequiredOptionKeys>
	& Required<Pick<SyzyPluginOptions, RequiredOptionKeys>>;

export default fp<SyzyPluginOptions>(function SyzyPlugin (fastify, options, done) {
	const opts = {
		...defaultOptions,
		...options,
	} as SyzyPluginOptionsWithDefaults;

	fastify.register(FastifySensible);
	fastify.register(FastifyFormBody);
	fastify.register(FastifyHelmet, buildHelmetConfig(opts));
	fastify.register(FastifyStatic, {
		root: path.join(process.cwd(), opts.publicPath),
		dotfiles: 'deny',
		serveDotFiles: false,
		// TODO: any other settings we want?
	});

	fastify.register(TemplatesPlugin, opts);
	fastify.register(RoutesPlugin, opts);

	done();
}, {
	fastify: '5.x',
	name: 'syzy',
});

export const recommendedOptions: FastifyServerOptions = {
	ignoreTrailingSlash: true,
	ignoreDuplicateSlashes: true,
};
