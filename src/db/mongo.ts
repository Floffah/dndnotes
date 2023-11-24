import { connect } from "mongoose";

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function mongoConnect() {
    if (process.env.CI) {
        return;
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = connect(process.env.MONGODB_URI as string).then(
            (mongoose) => mongoose,
        );
    }
    cached.conn = await cached.promise;
    return cached.conn;
}
