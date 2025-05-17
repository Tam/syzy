import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import Fastify from 'fastify';
import SyzyPlugin from '../src/index';

describe('syzy Plugin', () => {
	let fastify: ReturnType<typeof Fastify>;

	beforeAll(() => {
		fastify = Fastify();
	});

	afterAll(async () => {
		await fastify.close();
	});

	test('should register the plugin successfully', async () => {
		await fastify.register(SyzyPlugin);
		// expect(fastify.syzy).toBeDefined();
	});
});
