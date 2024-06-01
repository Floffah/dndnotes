import { DiscordActivityFeatureFlags } from "@dndnotes/models";

import { authedProcedure, router } from "@/trpc/trpc";

export const discordActivitiesRouter = router({
    getFeatures: authedProcedure.query(async (opts) => {
        const features: DiscordActivityFeatureFlags[] = [];

        if (opts.ctx.guild) {
            if (!opts.ctx.guild.botIgnored && !opts.ctx.guild.botInGuild) {
                features.push(
                    DiscordActivityFeatureFlags.SHOW_INVITE_BOT_BUTTON,
                );
            }
        } else {
            features.push(DiscordActivityFeatureFlags.SHOW_INVITE_BOT_BUTTON);
        }

        return features;
    }),
});
