"use client";

import { trpc } from "@/app/api/lib/trpc";
import { Icon } from "@/app/components/Icon";
import { authenticateUser } from "@/app/lib/authentication";

export function DiscordLoginButton() {
    const utils = trpc.useUtils();

    return (
        <button
            className="flex items-center gap-2 self-center rounded-md bg-discord-blurple px-3 py-1 outline-0 ring-0"
            onClick={() => {
                authenticateUser((user) => {
                    utils.getCurrentUser.setData(undefined, user);
                });
            }}
        >
            <Icon label="discord icon" icon="ic:baseline-discord" />
            Login with Discord
        </button>
    );
}
