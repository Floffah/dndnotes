"use client";

import { useEffect } from "react";
import { deserialize } from "superjson";

import { authenticateDiscord } from "@/app/api/discord/redirect/action";

// not bad practice, react encourages it for this kind of thing here :) https://react.dev/learn/you-might-not-need-an-effect
let didAuthenticate = false;
export default function DiscordRedirectPage({
    searchParams: { code },
}: {
    searchParams: {
        code?: string;
        error?: string;
        error_description?: string;
    };
}) {
    useEffect(() => {
        if (!didAuthenticate) {
            didAuthenticate = true;

            if (code) {
                const onReady = async () => {
                    const user = deserialize(await authenticateDiscord(code));

                    window.opener.callback(user);
                    window.close();
                };

                if (document.readyState === "loading") {
                    document.addEventListener("DOMContentLoaded", onReady);
                } else {
                    onReady();
                }
            } else {
                window.close();
            }
        }
    });

    return null;
}
