import { parse } from "superjson";

import { User } from "@dndnotes/models";

import { getDiscordRedirectURL } from "@/app/lib/getDiscordRedirectURL";

declare global {
    interface Window {
        callback: (response: string) => void;
    }
}

export function authenticateUser() {
    return new Promise<User>((resolve, reject) => {
        window.callback = (responseString) => {
            const response = parse(responseString);

            clearInterval(interval);

            if (response instanceof Error) {
                reject(response);
            } else {
                resolve(response as User);
            }
        };

        const authWindow = window.open(getDiscordRedirectURL(), "_blank");

        if (!authWindow || !authWindow.opener) {
            reject(new Error("Unable to open auth window"));
            return;
        }

        const interval = setInterval(() => {
            if (authWindow.closed) {
                clearInterval(interval);
                reject(new Error("Window was closed before response"));
            }
        }, 500);
    });
}
