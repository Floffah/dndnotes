import { DiscordActivityFeatureFlags } from "@/enums";
import { ensureAuthenticated } from "@/lib/ensureAuthenticated";
import { DiscordGuildModel } from "@/models";
import { procedure, router } from "@/router/context";

export const discordActivitiesRouter = router({
    getFeatures: procedure().query(async (opts) => {
        await ensureAuthenticated(opts.ctx);

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
