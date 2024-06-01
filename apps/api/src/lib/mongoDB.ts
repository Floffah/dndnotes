import { connect } from "mongoose";

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

declare global {
    var mongoose: {
        conn: typeof import("mongoose") | null;
        promise: Promise<typeof import("mongoose")> | null;
    };
}

export async function mongoConnect(connectionUrl?: string) {
    if (process.env.CI || process.env.NODE_ENV === "test") {
        return;
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = connect(
            connectionUrl ?? (process.env.MONGODB_URI as string),
        ).then((mongoose) => mongoose);
    }
    cached.conn = await cached.promise;
    return cached.conn as typeof import("mongoose");
}

export function resetConnection() {
    cached.conn = null;
    cached.promise = null;
}
