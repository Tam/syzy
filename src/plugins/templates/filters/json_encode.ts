import Twig from 'twig';

/**
 * JSON encode Twig filter
 *
 * Accepts an optional argument to specify the number of spaces to use for indentation.
 *
 * ```twig
 * {{ value|json_encode(4) }}
 * ```
 */
Twig.extendFilter(
	'json_encode',
	(value, args) => JSON.stringify(value, null, parseInt((args as [string])?.[0] ?? null)),
);
