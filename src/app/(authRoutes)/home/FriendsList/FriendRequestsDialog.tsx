"use client";

import { PropsWithChildren } from "react";

import { Dialog } from "@/app/components/Dialog";
import { Icon } from "@/app/components/Icon";
import { Loader } from "@/app/components/Loader";
import { useUser } from "@/app/providers/UserProvider";
import { FriendshipRequestState } from "@/db/enums/FriendshipRequestState";

export function FriendRequestsDialog({ children }: PropsWithChildren) {
    const user = useUser();

    return (
        <Dialog>
            <Dialog.Trigger asChild>{children}</Dialog.Trigger>

            <Dialog.Overlay />
            <Dialog.Content className="max-w-sm">
                <Dialog.Content.Title>Friend Requests</Dialog.Content.Title>
                <Dialog.Content.Body>
                    {user.friendsLoading && (
                        <div className="flex w-full justify-center py-4">
                            <Loader className="h-5 w-5" />
                        </div>
                    )}
                    {user.incomingRequests.length === 0 &&
                        !user.friendsLoading && (
                            <p className="py-4 text-center text-white/75">
                                No incoming requests
                            </p>
                        )}
                    {user.incomingRequests.map((request) => (
                        <div
                            key={request.id}
                            className="flex items-center gap-2"
                        >
                            <button
                                className="h-fit w-fit text-sm text-green-500"
                                onClick={() =>
                                    user.updateIncomingRequest(request.id, {
                                        state: FriendshipRequestState.ACCEPTED,
                                    })
                                }
                            >
                                <Icon
                                    label="accept request"
                                    icon="mdi:check"
                                    className="h-4 w-4"
                                />
                            </button>
                            <button
                                className="h-fit w-fit text-sm text-red-500"
                                onClick={async () => {
                                    await user.updateIncomingRequest(
                                        request.id,
                                        {
                                            state: FriendshipRequestState.DENIED,
                                        },
                                    );
                                }}
                            >
                                <Icon
                                    label="deny request"
                                    icon="mdi:close"
                                    className="h-4 w-4"
                                />
                            </button>
                            <p>{request.sender?.name}</p>
                        </div>
                    ))}
                </Dialog.Content.Body>
            </Dialog.Content>
        </Dialog>
    );
}
