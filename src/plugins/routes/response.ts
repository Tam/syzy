import { FastifyReply, FastifyRequest } from 'fastify';
import path from 'path';
import { SyzyState } from '@/types';

export enum ResponseType {
	Redirect,
	Error,
}

export default class SyzyResponse {
	private readonly type: ResponseType;
	private readonly uri?: string;
	private readonly status?: number;
	private readonly message?: string;

	constructor (type: ResponseType, uri?: string, status?: number, message?: string) {
		this.type = type;
		this.uri = uri;
		this.status = status;
		this.message = message;
	}

	public async handle (state: SyzyState, request: FastifyRequest, reply: FastifyReply) {
		switch (this.type) {
			case ResponseType.Redirect:
				if (!this.uri) throw new Error('Redirect response must have a URI');

				return reply.redirect(this.uri, this.status);

			case ResponseType.Error:
				if (!this.status) throw new Error('Error response must have a status code');

				const globalContext = await state.globalHandler?.(request) ?? {};

				return reply.code(this.status).viewAsync(
					path.join(state.routesPath, state.errorsPath, `${this.status}.twig`),
					{
						...globalContext,
						message: this.message,
					},
				);
		}
	}
}

export function error (status: number, message?: string) {
	return new SyzyResponse(ResponseType.Error, void 0, status, message);
}

export function redirect (uri: string, status?: number) {
	return new SyzyResponse(ResponseType.Redirect, uri, status);
}

redirect.temporary = (uri: string) => {
	return redirect(uri, 307);
};

redirect.permanent = (uri: string) => {
	return redirect(uri, 308);
};
