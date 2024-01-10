import { EmbedBuilder, WebhookClient } from "discord.js";
import "dotenv/config";

const client = new WebhookClient({
    url: process.env.DISCORD_WEBHOOK_LOGS as string,
});

client.send({
    embeds: [
        new EmbedBuilder()
            .setTitle("Deployment finished")
            .setDescription(
                "Build finished - wait for domains and functions to update.",
            )
            .setURL(
                `https://github.com/floffah/dndnotes/commit/${process.env.VERCEL_GIT_COMMIT_SHA}`,
            )
            .addFields(
                {
                    name: "commit",
                    value: `(${process.env.VERCEL_GIT_COMMIT_SHA}) ${process.env.VERCEL_GIT_COMMIT_MESSAGE}`,
                    inline: true,
                },
                {
                    name: "author",
                    value:
                        process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME || "unknown",
                    inline: true,
                },
            ),
    ],
});
