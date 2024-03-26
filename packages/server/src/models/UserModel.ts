import { Schema } from "mongoose";

import { User } from "@dndnotes/models";

import { createModel } from "@/lib/createModel";

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

export const UserSchema = new Schema<User>({
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
});

export const UserModel = createModel("User", UserSchema);
