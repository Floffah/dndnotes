"use client";

import { PropsWithChildren, useState } from "react";

import { Dialog } from "@/app/components/Dialog";
import { IncomingRequestsTab } from "@/app/home/FriendsList/FriendRequestsDialog/IncomingRequestsTab";
import { OutgoingRequestsTab } from "@/app/home/FriendsList/FriendRequestsDialog/OutgoingRequestsTab";

export function FriendRequestsDialog({ children }: PropsWithChildren) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog onOpenChange={setOpen}>
            <Dialog.Trigger asChild>{children}</Dialog.Trigger>

            <Dialog.Content className="max-w-sm">
                <Dialog.Content.Title>Friend Requests</Dialog.Content.Title>
                <Dialog.Content.Body>
                    {/* TODO: make this an actual tab @radix-ui/react-tabs*/}
                    <OutgoingRequestsTab dialogOpen={open} />
                    <IncomingRequestsTab dialogOpen={open} />
                </Dialog.Content.Body>
            </Dialog.Content>
        </Dialog>
    );
}
