import { Route } from '@/types';
import { redirect } from '@/index';

export default {
	handler () {
		return redirect.temporary('/');
	},
} as Route;
