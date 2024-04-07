export enum ServerErrorCode {
    PARSE_ERROR = "PARSE_ERROR",
    BAD_REQUEST = "BAD_REQUEST",
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    NOT_FOUND = "NOT_FOUND",
    METHOD_NOT_SUPPORTED = "METHOD_NOT_SUPPORTED",
    TIMEOUT = "TIMEOUT",
    CONFLICT = "CONFLICT",
    PRECONDITION_FAILED = "PRECONDITION_FAILED",
    PAYLOAD_TOO_LARGE = "PAYLOAD_TOO_LARGE",
    UNSUPPORTED_MEDIA_TYPE = "UNSUPPORTED_MEDIA_TYPE",
    UNPROCESSABLE_CONTENT = "UNPROCESSABLE_CONTENT",
    TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",
    CLIENT_CLOSED_REQUEST = "CLIENT_CLOSED_REQUEST",
}

export class ServerError extends Error {
    public readonly cause?: Error;
    public readonly code: ServerErrorCode | string;

    constructor(opts: {
        message?: string;
        code: ServerErrorCode | string;
        cause?: any;
    }) {
        const message = opts.message ?? opts.cause?.message ?? opts.code;

        super(message);

        this.code = opts.code;
        this.name = "ServerError";
        this.cause = opts.cause;
    }
}
