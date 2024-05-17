import { z } from "zod";

import { ServerErrorCode } from "@/shared/error";
import { ProcedureType } from "@/shared/procedure";

/**
 * The type of message being sent
 */
export enum SocketMessageType {
    REQUEST = "REQUEST",
    RESPONSE = "RESPONSE",
    AUTH_REQUEST = "AUTH_REQUEST",
    AUTH_RESPONSE = "AUTH_RESPONSE",
    CONNECTION_ERROR = "CONNECTION_ERROR",
}

/**
 * Base message type
 */
export const baseSocketMessage = z.object({
    type: z.nativeEnum(SocketMessageType),
});

/**
 * The type of server bound request being made
 */
export enum SocketRequestType {
    QUERY = "QUERY",
    MUTATION = "MUTATION",
    SUBSCRIPTION = "SUBSCRIPTION",
    UNSUBSCRIPTION = "UNSUBSCRIPTION",
}

export const socketRequestTypeMap = {
    [ProcedureType.Mutation]: SocketRequestType.MUTATION,
    [ProcedureType.Query]: SocketRequestType.QUERY,
};

/**
 * Server bound request message
 * Represents a query, mutation, or subscription request from the client
 */
export const socketRequest = baseSocketMessage.extend({
    type: z.literal(SocketMessageType.REQUEST),
    /**
     * Client-generated unique identifier for the request, used to match responses to requests
     */
    id: z.string(),
    content: z.object({
        type: z.nativeEnum(SocketRequestType),
        /**
         * The path of the procedure being called
         */
        path: z.string(),
        payload: z.any().optional(),
    }),
});

/**
 * The status of the response
 */
export enum ResponseStatus {
    OK = "OK",
    ERROR = "ERROR",
}

/**
 * Object that contains type information about the objects in the payload
 * Used by the client to cache objects
 * Client bound only
 */
export const socketPayloadTypeInfo = z.record(
    /**
     * The path to the object type
     */
    z.string(),
    z.object({
        typeName: z.string(),
        id: z.string(),
        noCache: z.boolean().optional(),
    }),
);

/**
 * Error object
 */
export const socketError = z.object({
    code: z.nativeEnum(ServerErrorCode),
    message: z.string(),
});
/**
 * Base content of a response
 */
export const socketResponseBaseContent = z.object({
    status: z.nativeEnum(ResponseStatus),
});
/**
 * Client bound response message
 * Represents a response to a query or mutation, but can also represent a subscription update
 * Sent multiple times as a response to a subscription request, but only once for a query or mutation
 */
export const socketResponse = baseSocketMessage.extend({
    type: z.literal(SocketMessageType.RESPONSE),
    /**
     * The client-generated unique identifier for the request that triggered this response, used to match responses to requests
     */
    id: z.string(),
    content: z.union([
        socketResponseBaseContent.extend({
            status: z.literal(ResponseStatus.OK),
            payload: z.any(),
            typeInfo: socketPayloadTypeInfo,
        }),
        socketResponseBaseContent.extend({
            status: z.literal(ResponseStatus.ERROR),
            error: socketError,
        }),
    ]),
});

/**
 * Authentication request message
 * Sent by the client to authenticate with the server
 */
export const socketAuthRequest = baseSocketMessage.extend({
    type: z.literal(SocketMessageType.AUTH_REQUEST),
    content: z.any(),
});

/**
 * Base content of an authentication response
 */
export const baseSocketAuthResponseContent = z.object({
    type: z.literal(SocketMessageType.AUTH_RESPONSE),
    status: z.nativeEnum(ResponseStatus),
});

/**
 * Authentication response message
 * Sent by the server in response to an authentication request
 */
export const socketAuthResponse = z.union([
    baseSocketAuthResponseContent.extend({
        status: z.literal(ResponseStatus.OK),
    }),
    baseSocketAuthResponseContent.extend({
        status: z.literal(ResponseStatus.ERROR),
        error: socketError,
    }),
]);

/**
 * Connection error message
 * Sent when an error occurs relating to the connection, but outwith the normal request/response flow
 * Errors that occur during the request/response flow are sent as part of the response
 */
export const socketConnectionError = baseSocketMessage.extend({
    type: z.literal(SocketMessageType.CONNECTION_ERROR),
    content: z.object({
        error: socketError,
    }),
});

export const socketMessage = z.union([
    socketRequest,
    socketResponse,
    socketAuthRequest,
    socketAuthResponse,
    socketConnectionError,
]);
export const serverBoundSocketMessage = z.union([
    socketRequest,
    socketAuthRequest,
]);
export const clientBoundSocketMessage = z.union([
    socketResponse,
    socketAuthResponse,
    socketConnectionError,
]);
