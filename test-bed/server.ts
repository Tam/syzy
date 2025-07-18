import Fastify from 'fastify';
import SyzyPlugin, { recommendedOptions } from '@/index';

// Create a Fastify instance
const fastify = Fastify({
	...recommendedOptions,
	logger: {
		transport: {
			target: 'pino-pretty',
			options: {
				ignore: 'pid,hostname',
			},
		},
	},
});

// Register our plugin
await fastify.register(SyzyPlugin, {
	routesPath: './test-bed/app',
	publicPath: './test-bed/public',
	globalHandler: () => ({ global: 'variable' }),
	// helmet: {
	// 	contentSecurityPolicy: {
	// 		directives: {
	// 			'script-src': [
	//              // Added automatically by the `{% js %}` tag
	// 				'unpkg.com',
	// 				"'sha256-4gndpcgjVHnzFm3vx3UOHbzVpcGAi3eS/C5nM3aPtEc='", // htmx
	// 				"'sha256-zR7P64Kxm86KxUpEUVj9tVZXcNhWfL62CVIBEYHJ060='", // htmx-preload
	// 			],
	// 		},
	// 	}
	// },
	headers: {
		'x-default-header': 'hi',
	},
});

// Start the server
try {
	await fastify.listen({ port: 3000, host: '::' });
} catch (err) {
	fastify.log.error(err);
	process.exit(1);
}
