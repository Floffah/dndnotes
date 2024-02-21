import * as fs from "fs";
import { EmbedBuilder, WebhookClient } from "discord.js";
import "dotenv/config";
import { readCommit } from "isomorphic-git";

async function run() {
    const client = new WebhookClient({
        url: process.env.DISCORD_WEBHOOK_LOGS as string,
    });

    let commitSha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA;
    let commitMessage = process.env.VERCEL_GIT_COMMIT_MESSAGE;

    if (!commitMessage && commitSha) {
        const result = await readCommit({
            fs,
            dir: process.cwd(),
            oid: commitSha,
        });

        commitMessage = result.commit.message;
    }

    await client.send({
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
                        value: `(${commitSha || "no commit sha"}) ${commitMessage || "no message"}`,
                        inline: true,
                    },
                    {
                        name: "author",
                        value:
                            process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME ||
                            process.env.GITHUB_ACTOR ||
                            "unknown",
                        inline: true,
                    },
                ),
        ],
    });
}

run();
