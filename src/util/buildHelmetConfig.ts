import { SyzyPluginOptionsWithDefaults } from '@/index';
import helmet from 'helmet';

export default function buildHelmetConfig (opts: SyzyPluginOptionsWithDefaults) {
	const userHelmetOptions = opts.helmet;
	const useDefaultCSP = userHelmetOptions.contentSecurityPolicy === true
		|| (userHelmetOptions.contentSecurityPolicy !== false
		&& userHelmetOptions.contentSecurityPolicy?.useDefaults !== false);
	const defaultDirectives = helmet.contentSecurityPolicy.getDefaultDirectives();
	if (process.env.NODE_ENV === 'dev') delete defaultDirectives['upgrade-insecure-requests'];

	return mergeHelmetConfig({
		contentSecurityPolicy: useDefaultCSP ? {
			useDefaults: false,
			directives: defaultDirectives,
		} : void 0,
	}, userHelmetOptions);
}

function mergeHelmetConfig (
	base: Record<string, any>,
	user: Record<string, any> = {},
): Record<string, any> {
	const result = { ...base };

	for (const key in user) {
		const curr = base[key];
		const next = user[key];

		if (typeof next === 'boolean') result[key] = next;
		else if (Array.isArray(next)) {
			if (Array.isArray(curr)) result[key] = [...new Set([...curr, ...next])];
			else result[key] = [...next];
		}
		else if (
			next !== null
			&& typeof next === 'object'
			&& curr !== null
			&& typeof curr === 'object'
		) {
			result[key] = mergeHelmetConfig(curr, next);
		} else result[key] = next;
	}

	return result;
}
