import { getDiscordRedirectURL } from "@/app/lib/getDiscordRedirectURL";
import type { UserAPIType } from "@/db/models/User/consumers";

declare global {
    interface Window {
        callback: (user: UserAPIType) => void;
    }
}

export function authenticateUser(onSuccess: (user: UserAPIType) => void) {
    return new Promise<void>((resolve, reject) => {
        window.callback = onSuccess;

        const authWindow = window.open(getDiscordRedirectURL(), "_blank");

        if (!authWindow || !authWindow.opener) {
            reject(new Error("Unable to open auth window"));
            return;
        }

        const interval = setInterval(() => {
            if (authWindow.closed) {
                clearInterval(interval);
                resolve(void 0);
            }
        }, 500);
    });
}
