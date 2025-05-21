import { Route } from '@/types';

export default {
	headers: {
		'x-test': 'hello',
	},
	handler (options) {
		return {
			greeting: 'Hello world!',
			items: Array.from({ length: 10 }, (_, i) => ({
				id: i,
				name: `Item ${i}`,
			})),
			headers: {
				'x-test-2': 'world',
			},
		};
	}
} as Route;
