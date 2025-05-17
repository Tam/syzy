import { Route } from '@/types';

export default {
	options: {
		schema: {
			body: {
				type: 'object',
				properties: {
					aNumber: { type: 'number' },
				},
			}
		},
	},
	async handler (request) {
		return {
			success: Boolean(request.body.aNumber) && !isNaN(request.body.aNumber),
		};
	},
} as Route;
