import fp from 'fastify-plugin';
import FastifyView from '@fastify/view';
import Twig from 'twig';
import { SyzyPluginOptionsWithDefaults } from '@/index';

// TODO: twig extensions

export default fp<SyzyPluginOptionsWithDefaults>(function TemplatesPlugin (app, options, done) {
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

	app.register(FastifyView, {
		engine: {
			twig: Twig,
		},
		viewExt: 'twig',
	});

	done();
});

/**
 * JSON encode Twig filter
 *
 * Accepts an optional argument to specify the number of spaces to use for indentation.
 *
 * ```twig
 * {{ value|json_encode(4) }}
 * ```
 */
Twig.extendFilter(
	'json_encode',
	(value, args) => JSON.stringify(value, null, parseInt((args as [string])?.[0] ?? null)),
);
