import { FastifyReply } from 'fastify';
import { HttpErrorCodesLoose } from '@fastify/sensible';

export enum ResponseType {
	Redirect,
	Error,
}

type StatusCodes = number | HttpErrorCodesLoose;

export default class SyzyResponse {
	private readonly type: ResponseType;
	private readonly uri?: string;
	private readonly status?: StatusCodes;
	private readonly message?: string;

	constructor (type: ResponseType, uri?: string, status?: StatusCodes, message?: string) {
		this.type = type;
		this.uri = uri;
		this.status = status;
		this.message = message;
	}

	public async handle (reply: FastifyReply) {
		switch (this.type) {
			case ResponseType.Redirect:
				if (!this.uri) throw new Error('Redirect response must have a URI');

				return reply.redirect(this.uri, Number(this.status));

			case ResponseType.Error:
				if (!this.status) throw new Error('Error response must have a status code');

				return reply.getHttpError(this.status as HttpErrorCodesLoose, this.message);
		}
	}
}

export function error (status: StatusCodes, message?: string) {
	return new SyzyResponse(ResponseType.Error, void 0, status, message);
}

export function redirect (uri: string, status?: StatusCodes) {
	return new SyzyResponse(ResponseType.Redirect, uri, status);
}

redirect.temporary = (uri: string) => {
	return redirect(uri, 307);
};

redirect.permanent = (uri: string) => {
	return redirect(uri, 308);
};
