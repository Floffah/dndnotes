import { resetDatabase } from "../mongo";
import { config } from "dotenv";
import { connect, connection, disconnect } from "mongoose";

config();

process.env.MONGODB_URI = process.env.MONGODB_URI_TESTS;

beforeAll(async () => {
    await connect(process.env.MONGODB_URI_TESTS as string);
    await resetDatabase();
});

afterAll(async () => {
    await connection.close();
    await disconnect();
});
