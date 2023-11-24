import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DiscordLoginButton } from "@/app/DiscordLoginButton";
import { getTRPCServerHelpers } from "@/app/api/lib/server/getTRPCServerHelpers";
import { SESSION_TOKEN } from "@/app/api/lib/storage";

export default async function RootPage() {
    const helpers = getTRPCServerHelpers();

    const user =
        cookies().has(SESSION_TOKEN) && (await helpers.getCurrentUser.fetch());

    if (user) {
        redirect("/home");
    }

    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <main className="flex max-w-md flex-col gap-2 rounded-lg bg-white/10 p-4 shadow-md">
                <h1>DND Notes</h1>
                <p>
                    This site allows DMs and players alike to manage their
                    campaigns in a synchronised and dynamic way.
                </p>
                <DiscordLoginButton />
            </main>
        </div>
    );
}
