import fp from 'fastify-plugin';
import FastifyView from '@fastify/view';
import Twig from 'twig';
import { SyzyStateOptions } from '@/types';

// TODO: twig extensions

export interface TemplatePluginOptions {
	namespaces?: Record<string, string>;
}

export default fp<TemplatePluginOptions & SyzyStateOptions>(function TemplatesPlugin (app, options, done) {
	const _twig = Twig.twig;
	Twig.twig = (params) => {
		return _twig({
			...params,
			// Support absolute paths (i.e. '_layout.twig' instead of '../../_layout.twig')
			base: options._state.routesPath,
			// @ts-expect-error This is correct, it's just missing from the types
			namespaces: {
				// Base `@/` namespace
				'': options._state.routesPath,
				...(options?.namespaces ?? {})
			},
		});
	};

	app.register(FastifyView, {
		engine: {
			twig: Twig,
		},
		viewExt: 'twig',
	});

	done();
});
