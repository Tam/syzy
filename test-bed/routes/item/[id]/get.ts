import { error } from '@/index';
import { Route } from '@/types';

export default {
	handler (request) {
		const id = request.params.id;

		if (isNaN(id) || +id < 0 || +id > 9) {
			return error(404);
		}
	}
} as Route;
