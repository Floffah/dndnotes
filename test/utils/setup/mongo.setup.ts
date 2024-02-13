import { resetDatabase } from "../mongo";
import { config } from "dotenv";
import mongoose from "mongoose";

config();

process.env.MONGODB_URI = process.env.MONGODB_URI_TESTS;

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TESTS as string);

    await new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            if (mongoose.connection?.readyState === 1) {
                clearInterval(interval);
                resolve(void 0);
            } else if (mongoose.connection?.readyState !== 2) {
                clearInterval(interval);
                reject(new Error("Failed to connect to database"));
            }
        }, 100);
    });

    await resetDatabase();
});

afterAll(async () => {
    await mongoose.disconnect();
});
