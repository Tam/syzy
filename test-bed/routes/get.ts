import { Route } from '@/types';

export default {
	handler (options) {
		return {
			greeting: 'Hello world!',
			items: Array.from({ length: 10 }, (_, i) => ({
				id: i,
				name: `Item ${i}`,
			})),
		};
	}
} as Route;
