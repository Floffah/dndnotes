import { cookies } from "next/headers";
import { RedirectType, redirect } from "next/navigation";

import { getTRPCServerHelpers } from "@/app/api/lib/server/getTRPCServerHelpers";
import { SESSION_TOKEN } from "@/app/api/lib/storage";
import { LoginDialog } from "@/app/components/LoginDialog";

export default async function RootPage() {
    const helpers = await getTRPCServerHelpers();

    const user =
        cookies().has(SESSION_TOKEN) && (await helpers.user.me.fetch());

    if (user) {
        redirect("/home", RedirectType.replace);
    }

    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <LoginDialog open={true} />
        </div>
    );
}
