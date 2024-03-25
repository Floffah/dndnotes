import { connect } from "mongoose";

export const databaseProviders = [
    {
        provide: "DATABASE_CONNECTION",
        useFactory: async () => {
            return await connect(process.env.MONGODB_URI);
        },
    },
];
