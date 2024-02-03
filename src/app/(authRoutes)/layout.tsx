import { getTRPCServerHelpers } from "@/app/api/lib/server/getTRPCServerHelpers";
import { serializableClone } from "@/app/lib/serializableClone";
import { Hydrate } from "@/app/providers/Hydrate";
import { UserProvider } from "@/app/providers/UserProvider";

export default async function AuthLayout({ children }) {
    const helpers = await getTRPCServerHelpers();

    await helpers.user.me.prefetch();

    return (
        <Hydrate state={serializableClone(helpers.dehydrate())}>
            <UserProvider>{children}</UserProvider>
        </Hydrate>
    );
}
