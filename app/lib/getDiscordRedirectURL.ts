export function getDiscordRedirectURL() {
    const url = new URL("https://discord.com/api/oauth2/authorize");

    url.searchParams.append(
        "client_id",
        process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID as string,
    );
    url.searchParams.append(
        "redirect_uri",
        process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI as string,
    );
    url.searchParams.append("response_type", "code");
    url.searchParams.append("scope", "identify email");

    return url.toString();
}
