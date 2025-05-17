import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import Fastify from 'fastify';
import syzyPlugin from '../src/index';

describe('syzy Plugin', () => {
	let fastify: ReturnType<typeof Fastify>;

	beforeAll(() => {
		fastify = Fastify();
	});

	afterAll(async () => {
		await fastify.close();
	});

	test('should register the plugin successfully', async () => {
		await fastify.register(syzyPlugin);
		expect(fastify.syzy).toBeDefined();
	});
});
