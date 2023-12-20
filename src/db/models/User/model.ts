import { Schema, model } from "mongoose";

import { User } from "@/db/models/User/index";
import { decorateSchema } from "@/db/models/decorateSchema";

const DiscordProviderSchema = new Schema({
    id: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
});

const UserProvidersSchema = new Schema({
    discord: {
        type: DiscordProviderSchema,
        required: false,
    },
});

export const UserSchema = decorateSchema(
    new Schema<User>({
        name: {
            type: String,
            unique: true,
            index: true,
            required: true,
        },
        email: {
            type: String,
            index: true,
            unique: true,
            required: true,
        },
        providers: {
            type: UserProvidersSchema,
            required: false,
        },
    }),
);

export const UserModel = model("User", UserSchema, undefined, {
    overwriteModels: true,
});
