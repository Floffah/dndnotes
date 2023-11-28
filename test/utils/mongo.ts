import { connection } from "mongoose";

export async function resetDatabase() {
    if (connection.readyState === 0) {
        throw new Error("Not connected to database");
    }

    const collections = await connection.db.collections();

    await Promise.all(
        collections.map((collection) => collection.deleteMany({})),
    );
}

export function mongoJestHooks() {}
