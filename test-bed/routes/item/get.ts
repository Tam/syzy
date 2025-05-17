import { Route } from '@/types';
import { redirect } from '@/index';

export default {
	handler () {
		return redirect('/');
	},
} as Route;
