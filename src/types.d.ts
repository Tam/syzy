import { TemplatePluginOptions } from '@/plugins/templates';
import SyzyResponse from '@/plugins/routes/response';
import { FastifyHelmetOptions } from '@fastify/helmet';
import { RouteShorthandOptions } from 'fastify/types/route';
import { HttpHeader } from 'fastify/types/utils';

type Headers = Partial<Record<HttpHeader, number | string | string[] | undefined>>;
type HandlerResponse = void | { headers?: Headers, [key: string]: any } | SyzyResponse;
type HandlerResponsePromise = Promise<HandlerResponse>;
type Handler = (request: FastifyRequest) => HandlerResponse | HandlerResponsePromise;

export interface SyzyPluginOptions {
	routesPath?: string;
	errorsPath?: string;
	publicPath?: string;
	templates?: TemplatePluginOptions;
	globalHandler?: Handler;
	helmet?: FastifyHelmetOptions;
	headers?: Headers;
	defaultCacheControl?: string;
}

export interface Route {
	options?: RouteShorthandOptions,
	headers?: Headers;
	handler?: Handler;
}
