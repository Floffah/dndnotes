import { IBaseModel } from "@/types";

export interface DiscordGuild extends IBaseModel {
    guildId: string;
    botInGuild: boolean;
    botIgnored: boolean;
}
