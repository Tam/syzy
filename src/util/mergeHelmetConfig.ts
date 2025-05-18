export default function mergeHelmetConfig (
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
