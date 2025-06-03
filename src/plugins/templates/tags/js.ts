import Twig, { CompiledToken, TagToken } from 'twig';
import { randomBytes } from 'node:crypto';
import { FastifyReply } from 'fastify';

const JS_TAG_LOCATIONS = ['endBody', 'beginBody', 'head'] as const;
type JsTagLocation = typeof JS_TAG_LOCATIONS[number];

export const JS_SYMBOL = Symbol('__js');
export type JsContext = Record<JsTagLocation, {
	type: 'include' | 'inline',
	path?: string;
	attrs?: Record<string, string>;
	body?: string;
	nonce?: string;
}[]>;

Twig.extend(function JsTag (Twig) {
	interface JsToken extends Omit<TagToken, 'match' | 'stack'> {
		path: CompiledToken[];
		loc: JsTagLocation;
		attrs?: CompiledToken[];
	}

	/**
	 * {% js 'path or url to JS file' [at (head|beginBody|endBody)] [with { some: attributes }] %}
	 */
	Twig.exports.extendTag({
		type: 'js',
		regex: new RegExp(`^js\\s+(?<path>['"](.+?)['"])(?:\\s|$)(at (?<loc>${JS_TAG_LOCATIONS.join('|')})(?:\\s|$))?(?:with\\s+(?<attrs>[\\S\\s]+?))?(?:\\s|$)$`),
		next: [],
		open: true,
		// @ts-ignore
		compile (token) {
			const groups = token.match.groups as {
				path: string;
				loc?: string;
				attrs?: string;
			};

			const path = groups.path.trim();
			const loc = groups.loc?.trim() ?? JS_TAG_LOCATIONS[0];
			const attrs = groups.attrs?.trim();

			return {
				type: token.type,
				path: Twig.expression.compile.call(this, {
					type: Twig.expression.type.string,
					value: path,
				}).stack,
				loc: loc,
				attrs: attrs ? Twig.expression.compile.call(this, {
					type: Twig.expression.type.object,
					value: attrs,
				}).stack : void 0,
			} as JsToken;
		},
		// @ts-ignore
		parse (token: JsToken, context, chain) {
			const path = Twig.expression.parse.call(this, token.path, context);
			const attrs = token.attrs ? Twig.expression.parse.call(this, token.attrs, context) : {};
			const loc = token.loc;

			if (JS_SYMBOL in context) {
				if (!(loc in (context as any)[JS_SYMBOL]))
					(context as any)[JS_SYMBOL][loc] = [];

				(context as any)[JS_SYMBOL][loc].push({
					type: 'include',
					path,
					attrs,
				});
			}

			return {
				chain,
				output: '',
			};
		},
	});

	/**
	 * {% js [at (head|beginBody|endBody)] %}
	 *     console.log('hello');
	 * {% endjs %}
	 */
	Twig.exports.extendTag({
		type: 'js_block',
		regex: new RegExp(`^js\\s+(at (?<loc>${JS_TAG_LOCATIONS.join('|')})?(?:\\s|$))$`),
		next: ['endjs'],
		open: true,
		compile (token) {
			const loc = (token.match.groups as any).loc?.trim() ?? JS_TAG_LOCATIONS[0];

			// @ts-ignore
			delete token.match;
			return {
				...token,
				loc,
			};
		},
		parse (token, context, chain) {
			const { loc, output } = token as any;

			if (JS_SYMBOL in context) {
				if (!(loc in (context as any)[JS_SYMBOL]))
					(context as any)[JS_SYMBOL][loc] = [];

				(context as any)[JS_SYMBOL][loc].push({
					type: 'inline',
					// FIXME: Can't parse "raw" tags here
	 				body: 'console.log("FIXME")', //Twig.expression.parse.call(this, output, context),
					nonce: randomBytes(16).toString('hex'),
				});
			}

			return {
				chain,
				output: '',
			};
		},
	});

	Twig.exports.extendTag({
		type: 'endjs',
		regex: /^endjs$/,
		next: [],
		open: false,
	});
});

export function attachJsContext (reply: FastifyReply) {
	(reply as any).locals[JS_SYMBOL] = {};
}

export function injectJsTags (reply: FastifyReply, payload: string): string {
	const context = (reply as any).locals[JS_SYMBOL] as JsContext;

	const addToCsp = new Set<string>();

	for (const key of JS_TAG_LOCATIONS) {
		const tags = context[key];
		if (!tags || tags.length === 0) continue;

		const str = [];

		for (const tag of tags) {
			if (tag.type === 'include') {
				if (!tag.path) continue;

				const attrs = tag.attrs ?? {};
				delete attrs._keys;

				if ('integrity' in attrs)
					addToCsp.add(`'${attrs.integrity}'`);

				if (tag.path.startsWith('http')) {
					const domain = new URL(tag.path).hostname;
					addToCsp.add(domain);
				}

				str.push(`<script src="${tag.path}" ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')}></script>`);
			} else {
				addToCsp.add(`'nonce-${tag.nonce}'`);

				str.push(`<script nonce="${tag.nonce}">${tag.body}</script>`);
			}
		}

		const js = str.join('\n');

		switch (key) {
			case 'beginBody':
				payload = payload.replace(/(<body(?:\s+[^>]*)?(?:\s*|\n*)>)/i, `$1\n${js}`);
				break;
			case 'endBody':
				payload = payload.replace(/(<\/body>)/i, `${js}\n$1`);
				break;
			case 'head':
				payload = payload.replace(/(<\/head>)/i, `${js}\n$1`);
				break;
			default:
				throw new Error(`Unknown location for JS injection: ${key}`);
		}
	}

	// TODO: Uncomment once https://github.com/fastify/fastify-helmet/pull/287 is merged
	// reply.helmet(config => {
	// 	config.contentSecurityPolicy.directives['script-src'] = [...new Set([
	// 		...(config.contentSecurityPolicy.directives['script-src'] ?? []),
	// 		...addToCsp,
	// 	])];
	//
	// 	return config;
	// });

	return payload;
}
