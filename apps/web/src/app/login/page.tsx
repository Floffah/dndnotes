import { SESSION_TOKEN } from "@dndnotes/lib";
import { cookies } from "next/headers";
import { RedirectType, redirect } from "next/navigation";

import { DiscordLoginButton } from "@/app/components/DiscordLoginButton";
import { getServerHelpers } from "@/app/lib/getServerHelpers";

export default async function LoginPage({
    searchParams: { redirectUri },
}: {
    searchParams: { redirectUri?: string };
}) {
    const helpers = await getServerHelpers();

    const user =
        cookies().has(SESSION_TOKEN) && (await helpers.user.me.fetch());

    console.log(user);

    if (user) {
        redirect(
            redirectUri ? decodeURIComponent(redirectUri) : "/home",
            RedirectType.replace,
        );
    }

    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="relative flex h-fit w-full max-w-md flex-col gap-2 rounded-md bg-gray-800 p-4 shadow-lg">
                <h1 className="text-center text-2xl font-bold">DND Notes</h1>
                <p className="text-center text-base text-white/80">
                    This site allows DMs and players alike to manage their
                    campaigns in a synchronised and dynamic way.
                </p>
                <DiscordLoginButton
                    redirectUri={redirectUri && decodeURIComponent(redirectUri)}
                />
            </div>
        </div>
    );
}
