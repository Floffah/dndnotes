"use client";

import { useEffect } from "react";

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
                    const res = await fetch("/api/discord/authenticate", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            code: new URLSearchParams(
                                window.location.search,
                            ).get("code"),
                        }),
                    }).then((res) => res.json());

                    window.opener.callback(res.data.user);
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
