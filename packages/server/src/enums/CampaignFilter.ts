export enum CampaignFilter {
    /**
     * Campaigns the user is a member of (includes ones they DM)
     */
    MEMBER_OF = "MEMBER_OF",
    /**
     * Campaigns the user DMs
     */
    CREATED = "CREATED",
    /**
     * Campaigns linked to the discord guild derived from context
     */
    GUILD_LINKED = "GUILD_LINKED",
}
