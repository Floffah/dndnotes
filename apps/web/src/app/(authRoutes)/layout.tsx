import { getServerHelpers } from "@/app/lib/getServerHelpers";
import { ServerHydrationBoundary } from "@/app/providers/ServerHydrationBoundary";
import { UserProvider } from "@/app/providers/UserProvider";

export default async function AuthLayout({ children }) {
    const helpers = await getServerHelpers();

    await helpers.user.me.prefetch();

    return (
        <ServerHydrationBoundary helpers={helpers}>
            <UserProvider>{children}</UserProvider>
        </ServerHydrationBoundary>
    );
}
