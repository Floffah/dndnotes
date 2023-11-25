"use client";

import { PropsWithChildren, forwardRef } from "react";

import { Dialog, DialogRef } from "@/app/components/Dialog";
import { DiscordLoginButton } from "@/app/components/DiscordLoginButton";

export const LoginDialog = forwardRef<
    DialogRef,
    PropsWithChildren<{ closable?: boolean; open?: boolean }>
>(({ children, open, closable = false }, ref) => {
    return (
        <Dialog ref={ref} closable={closable} open={open}>
            {children && <Dialog.Trigger asChild>{children}</Dialog.Trigger>}
            <Dialog.Content className="max-w-md">
                <Dialog.Content.Title>DND Notes</Dialog.Content.Title>
                <Dialog.Content.Description>
                    This site allows DMs and players alike to manage their
                    campaigns in a synchronised and dynamic way.
                </Dialog.Content.Description>
                <DiscordLoginButton />
            </Dialog.Content>
        </Dialog>
    );
});
