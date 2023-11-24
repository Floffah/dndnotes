"use client";

import { useEffect } from "react";

// not bad practice, react encourages it for this kind of thing here :) https://react.dev/learn/you-might-not-need-an-effect
let didAuthenticate = false;
export default function DiscordRedirectPage() {
    useEffect(() => {
        if (!didAuthenticate) {
            didAuthenticate = true;

            const onReady = async () => {
                const res = await fetch("/api/discord/authenticate", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        code: new URLSearchParams(window.location.search).get(
                            "code",
                        ),
                    }),
                }).then((res) => res.json());

                window.opener.callback(res.data.user);
                window.close();
            };

            // wait for document to become ready
            if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", onReady);
            } else {
                onReady();
            }
        }
    });

    return null;
}
