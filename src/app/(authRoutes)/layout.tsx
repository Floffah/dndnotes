import { getTRPCServerHelpers } from "@/app/api/lib/server/getTRPCServerHelpers";
import { DehydrateServerQueryHelpers } from "@/app/providers/DehydrateServerQueryHelpers";
import { UserProvider } from "@/app/providers/UserProvider";

export default async function AuthLayout({ children }) {
    const helpers = await getTRPCServerHelpers();

    const user = await helpers.user.me.fetch();

    return (
        <DehydrateServerQueryHelpers helpers={helpers}>
            <UserProvider>{children}</UserProvider>
        </DehydrateServerQueryHelpers>
    );
}
