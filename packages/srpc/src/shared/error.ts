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
    public readonly code: ServerErrorCode;

    constructor(opts: {
        message?: string;
        code: ServerErrorCode;
        cause?: any;
    }) {
        const message = opts.message ?? opts.cause?.message ?? opts.code;

        super(message);

        this.code = opts.code;
        this.name = "ServerError";
        this.cause = opts.cause;
        this.message = message;
    }
}

export function serializeError(err: any) {
    if (err instanceof ServerError) {
        return {
            _type: "ServerError",
            code: err.code,
            message: err.message,
            cause: err.cause,
        };
    }

    return err;
}

export function deserializeError(err: any): ServerError {
    if ("_type" in err && err._type === "ServerError") {
        return new ServerError({
            code: err.code,
            message: err.message,
            cause: err.cause,
        });
    }

    return new ServerError({
        code: ServerErrorCode.INTERNAL_SERVER_ERROR,
        cause: err,
    });
}

export function isSerializedError(err: any): boolean {
    //): err is ReturnType<typeof serializeError> {
    return "_type" in err && err._type === "ServerError";
}
