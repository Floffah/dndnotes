"use client";

import { trpc } from "@/app/api/lib/client/trpc";
import { Button } from "@/app/components/Button";
import { Divider } from "@/app/components/Divider";
import { Loader } from "@/app/components/Loader";
import { AddFriendForm } from "@/app/home/FriendsList/AddFriendForm";
import { FriendRequestsDialog } from "@/app/home/FriendsList/FriendRequestsDialog";
import { useUser } from "@/app/providers/UserProvider";

export function FriendsList() {
    const user = useUser();
    const friends = trpc.user.friends.getAccepted.useQuery({
        user: user.id,
    });

    const incomingRequests = trpc.user.friends.getPending.useQuery({
        to: user.id,
    });

    return (
        <div className="relative flex h-full w-full max-w-[17rem] flex-col gap-2 rounded-lg border border-white/10 bg-white/5 p-2">
            <p className="text-lg font-bold">Add Friends</p>

            <AddFriendForm />

            <FriendRequestsDialog>
                <Button size="md" color="secondary" className="mt-1">
                    {incomingRequests.data &&
                        incomingRequests.data?.length > 0 && (
                            <div className="flex aspect-square h-6 w-6 items-center justify-center rounded-full bg-red-700 text-sm text-white">
                                {incomingRequests.data.length > 9
                                    ? "9+"
                                    : incomingRequests.data.length}
                            </div>
                        )}
                    Friend requests
                </Button>
            </FriendRequestsDialog>

            <Divider className="my-3" />

            <p className="text-lg font-bold">Friends</p>

            {friends.isLoading && (
                <div className="flex w-full justify-center py-4">
                    <Loader className="h-5 w-5" />
                </div>
            )}
            {friends.data?.length === 0 && (
                <p className="px-2 py-5 text-center text-sm text-white/75">
                    You have no DNDNotes friends.
                    <br /> Add some!
                </p>
            )}
            {friends.data?.map((friend) => {
                const otherUser =
                    friend.sender!.id === user.id
                        ? friend.recipient!
                        : friend.sender!;

                return (
                    <div
                        key={friend.id}
                        className="flex items-center gap-2 text-white/75"
                    >
                        <div className="flex h-8 w-8 select-none items-center justify-center rounded-full bg-white/10">
                            <p className="text-sm font-bold">
                                {otherUser.name[0].toUpperCase()}
                            </p>
                        </div>
                        <p className="font-semibold">{otherUser.name}</p>
                    </div>
                );
            })}
        </div>
    );
}
