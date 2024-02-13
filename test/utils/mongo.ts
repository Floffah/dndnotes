import mongoose from "mongoose";

export async function resetDatabase() {
    if (mongoose.connection.readyState === 0) {
        throw new Error("Not connected to database");
    }

    const collections = await mongoose.connection.db.collections();

    await Promise.all(
        collections.map((collection) => collection.deleteMany({})),
    );
}
