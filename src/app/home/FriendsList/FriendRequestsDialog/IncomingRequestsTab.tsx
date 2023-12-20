import { trpc } from "@/app/api/lib/client/trpc";
import { Icon } from "@/app/components/Icon";
import { Loader } from "@/app/components/Loader";
import { useCache } from "@/app/providers/CacheProvider";
import { useUser } from "@/app/providers/UserProvider";
import { FriendshipRequestState } from "@/db/enums/FriendshipRequestState";

export function IncomingRequestsTab({ dialogOpen }: { dialogOpen: boolean }) {
    const user = useUser();
    const cache = useCache();

    const incomingRequests = trpc.user.friends.getPending.useQuery(
        {
            to: user.id,
        },
        {
            enabled: dialogOpen,
        },
    );

    const updateRequest = trpc.user.friends.updateRequest.useMutation();

    return (
        <>
            <p className="font-bold">Incoming</p>

            {incomingRequests.isLoading && (
                <div className="flex w-full justify-center py-4">
                    <Loader className="h-5 w-5" />
                </div>
            )}
            {incomingRequests.data?.length === 0 && (
                <p className="py-4 text-center text-white/75">
                    No incoming requests
                </p>
            )}
            {incomingRequests.data?.map((request) => (
                <div key={request.id} className="flex items-center gap-2">
                    <button
                        className="h-fit w-fit text-sm text-green-500"
                        onClick={async () => {
                            const updatedRequest =
                                await updateRequest.mutateAsync({
                                    state: FriendshipRequestState.ACCEPTED,
                                    id: request.id,
                                });

                            cache.user.friends.upsertPending(
                                {
                                    to: user.id,
                                },
                                updatedRequest,
                            );
                        }}
                    >
                        <Icon
                            label="accept request icon"
                            icon="mdi:check"
                            className="h-4 w-4"
                        />
                    </button>
                    <button
                        className="h-fit w-fit text-sm text-red-500"
                        onClick={async () => {
                            const updatedRequest =
                                await updateRequest.mutateAsync({
                                    state: FriendshipRequestState.DENIED,
                                    id: request.id,
                                });

                            cache.user.friends.upsertPending(
                                {
                                    to: user.id,
                                },
                                updatedRequest,
                            );
                        }}
                    >
                        <Icon
                            label="deny request icon"
                            icon="mdi:close"
                            className="h-4 w-4"
                        />
                    </button>
                    <p>{request.sender?.name}</p>
                </div>
            ))}
        </>
    );
}
