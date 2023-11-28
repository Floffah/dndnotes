import { resetDatabase } from "../mongo";
import { config } from "dotenv";
import { connect, connection, disconnect } from "mongoose";

config();

process.env.MONGODB_URI = process.env.MONGODB_URI_TESTS;

beforeAll(async () => {
    const connectedPromise = new Promise((resolve) =>
        connection.on("connected", resolve),
    );

    await connect(process.env.MONGODB_URI_TESTS as string);

    await connectedPromise;

    await resetDatabase();
});

afterAll(async () => {
    await disconnect();
});
