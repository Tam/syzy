import { TemplatePluginOptions } from '@/plugins/templates';
import SyzyResponse from '@/plugins/routes/response';

export interface SyzyPluginOptions {
	routesPath?: string;
	errorsPath?: string;
	templates?: TemplatePluginOptions;
}

export interface SyzyState {
	routesPath: string;
	errorsPath: string;
}

export interface SyzyStateOptions {
	_state: SyzyState;
}

type HandlerResponse = void | { [key: string]: any } | SyzyResponse;
type HandlerResponsePromise = Promise<HandlerResponse>;

interface Route {
	options?: RouteShorthandOptions,
	handler?: (request: FastifyRequest) => HandlerResponse | HandlerResponsePromise;
}
