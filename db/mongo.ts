import { connect } from "mongoose";

export async function connectMongo() {
    return await connect(process.env.MONGODB_URI as string);
}
