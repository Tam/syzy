import { TemplatePluginOptions } from '@/plugins/templates';
import SyzyResponse from '@/plugins/routes/response';
import { FastifyHelmetOptions } from '@fastify/helmet';

type HandlerResponse = void | { [key: string]: any } | SyzyResponse;
type HandlerResponsePromise = Promise<HandlerResponse>;
type Handler = (request: FastifyRequest) => HandlerResponse | HandlerResponsePromise;

export interface SyzyPluginOptions {
	routesPath?: string;
	errorsPath?: string;
	publicPath?: string;
	templates?: TemplatePluginOptions;
	globalHandler?: Handler;
	helmet?: FastifyHelmetOptions;
}

export interface SyzyState {
	routesPath: string;
	errorsPath: string;
	globalHandler?: Handler;
}

export interface SyzyStateOptions {
	_state: SyzyState;
}

interface Route {
	options?: RouteShorthandOptions,
	handler?: Handler;
}
