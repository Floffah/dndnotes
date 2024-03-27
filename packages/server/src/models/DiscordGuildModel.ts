import { Schema } from "mongoose";

import { DiscordGuild } from "@dndnotes/models/src";

import { createModel } from "@/lib/createModel";

export const DiscordGuildSchema = new Schema<DiscordGuild>({
    guildId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
});

export const DiscordGuildModel = createModel(
    "DiscordGuild",
    DiscordGuildSchema,
);
