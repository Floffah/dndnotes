import { connection } from "mongoose";

export async function resetDatabase() {
    const collections = await connection.db.collections();

    await Promise.all(
        collections.map((collection) => collection.deleteMany({})),
    );
}

export function mongoJestHooks() {}
