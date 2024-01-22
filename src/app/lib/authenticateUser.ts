import { getDiscordRedirectURL } from "@/app/lib/getDiscordRedirectURL";
import { User } from "@/db/models/User";

declare global {
    interface Window {
        callback: (user: User) => void;
    }
}

export function authenticateUser(onSuccess: (user: User) => void) {
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
