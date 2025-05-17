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
	routesPath: './test-bed/routes',
	publicPath: './test-bed/public',
});

// Start the server
try {
	await fastify.listen({ port: 3000, host: '::' });
} catch (err) {
	fastify.log.error(err);
	process.exit(1);
}
