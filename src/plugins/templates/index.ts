import './filters';
import './tags';
import fp from 'fastify-plugin';
import FastifyView from '@fastify/view';
import Twig from 'twig';
import { SyzyPluginOptionsWithDefaults } from '@/index';
import { attachJsContext, injectJsTags } from './tags/js';

export default fp<SyzyPluginOptionsWithDefaults>(function TemplatesPlugin (fastify, options, done) {
	const _twig = Twig.twig;
	Twig.twig = (params) => {
		return _twig({
			...params,
			// Support absolute paths (i.e. '_layout.twig' instead of '../../_layout.twig')
			base: options.routesPath,
			// @ts-expect-error This is correct, it's just missing from the types
			namespaces: {
				// Base `@/` namespace
				'': options.routesPath,
				...(options?.templates?.namespaces ?? {})
			},
		});
	};

	fastify.register(FastifyView, {
		engine: {
			twig: Twig,
		},
		viewExt: 'twig',
	});

	fastify.addHook('preHandler', (request, reply, done) => {
		attachJsContext(reply);

		done();
	});

	fastify.addHook('onSend', (request, reply, payload, done) => {
		payload = injectJsTags(reply, payload as string);

		done(null, payload);
	});

	done();
});


