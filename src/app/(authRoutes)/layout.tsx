import { getTRPCServerHelpers } from "@/app/lib/api/trpc/getTRPCServerHelpers";
import { ServerHydrationBoundary } from "@/app/providers/ServerHydrationBoundary";
import { UserProvider } from "@/app/providers/UserProvider";

export default async function AuthLayout({ children }) {
    const helpers = await getTRPCServerHelpers();

    const user = await helpers.user.me.fetch();

    return (
        <ServerHydrationBoundary helpers={helpers}>
            <UserProvider>{children}</UserProvider>
        </ServerHydrationBoundary>
    );
}
