import { resetDatabase } from "../mongo";
import { config } from "dotenv";
import mongoose from "mongoose";

config();

process.env.MONGODB_URI = process.env.MONGODB_URI_TESTS;

beforeAll(async () => {
    const connectedPromise = new Promise((resolve) =>
        setInterval(() => {
            if (mongoose.connection?.readyState === 1) {
                resolve(void 0);
            }
        }, 100),
    );

    await mongoose.connect(process.env.MONGODB_URI_TESTS as string);

    await connectedPromise;

    await resetDatabase();
});

afterAll(async () => {
    await mongoose.disconnect();
});
