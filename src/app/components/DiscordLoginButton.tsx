"use client";

import { useRouter } from "next/navigation";

import { Icon } from "@/app/components/Icon";
import { trpc } from "@/app/lib/api/trpc";
import { authenticateUser } from "@/app/lib/authenticateUser";

export function DiscordLoginButton({ redirectUri }: { redirectUri?: string }) {
    const router = useRouter();
    const utils = trpc.useUtils();

    return (
        <button
            className="flex items-center gap-2 self-center rounded-md bg-discord-blurple px-3 py-1 outline-0 ring-0"
            onClick={() => {
                authenticateUser((user) => {
                    utils.user.me.setData(undefined, user);

                    if (redirectUri) {
                        router.replace(redirectUri);
                    } else {
                        router.replace("/home");
                    }
                });
            }}
        >
            <Icon label="discord" icon="ic:baseline-discord" />
            Login with Discord
        </button>
    );
}
