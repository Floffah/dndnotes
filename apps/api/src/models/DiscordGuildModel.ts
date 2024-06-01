import { Schema } from "mongoose";

import { DiscordGuild } from "@dndnotes/models";

import { createModel } from "@/lib/createModel";

export const DiscordGuildSchema = new Schema<DiscordGuild>({
    guildId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    botInGuild: {
        type: Boolean,
        required: true,
        default: false,
    },
    botIgnored: {
        type: Boolean,
        required: true,
        default: false,
    },
});

export const DiscordGuildModel = createModel(
    "DiscordGuild",
    DiscordGuildSchema,
);
