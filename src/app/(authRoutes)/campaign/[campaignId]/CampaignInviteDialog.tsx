import clsx from "clsx";
import { PropsWithChildren, forwardRef, useRef, useState } from "react";

import { Dialog, DialogRef } from "@/app/components/Dialog";
import { Divider } from "@/app/components/Divider";
import { Icon } from "@/app/components/Icon";
import { Loader } from "@/app/components/Loader";
import { trpc } from "@/app/lib/api/trpc";
import { useAsyncEffect } from "@/app/lib/hooks/useAsyncEffect";
import { useCampaign } from "@/app/providers/CampaignProvider";
import { CampaignInvite } from "@/db/models/CampaignInvite";

export const CampaignInviteDialog = forwardRef<DialogRef, PropsWithChildren>(
    ({ children }, ref) => {
        const campaign = useCampaign();

        const [open, setOpen] = useState(false);

        const [invite, setInvite] = useState<CampaignInvite | null>(null);
        const [linkCopied, setLinkCopied] = useState(false);
        const copiedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

        const createInviteMutation = trpc.campaign.invite.create.useMutation();

        useAsyncEffect(
            function* ({ resolve }) {
                if (open && !createInviteMutation.isPending && !invite) {
                    const invite = yield* resolve(
                        createInviteMutation.mutateAsync({
                            campaignId: campaign.id,
                        }),
                    );

                    setInvite(invite);
                }
            },
            [open],
        );

        return (
            <Dialog ref={ref} onOpenChange={setOpen}>
                <Dialog.Trigger>{children}</Dialog.Trigger>

                <Dialog.Overlay />
                <Dialog.Content className="max-w-md">
                    <Dialog.Content.Title>
                        Invite to Campaign
                    </Dialog.Content.Title>

                    <Dialog.Content.Description>
                        Send your friends the link below.
                    </Dialog.Content.Description>

                    <Dialog.Content.Body>
                        <div className="flex items-center rounded-lg border border-gray-700 bg-gray-800 px-2 py-1 placeholder-white/40 outline-none ring-0 transition-colors duration-150 focus:ring-1 focus:ring-offset-0">
                            {invite ? (
                                <>
                                    <div className="flex-grow overflow-y-hidden overflow-x-scroll">
                                        {process.env.NEXT_PUBLIC_BASE_URL +
                                            `/campaign/${campaign.id}/join/${invite.code}`}
                                    </div>
                                    <Divider
                                        orientation="vertical"
                                        className="mx-1 h-full flex-shrink-0"
                                    />
                                    <button
                                        className="flex-shrink-0 px-1 transition-transform duration-150 hover:scale-110"
                                        onClick={() => {
                                            if (copiedTimeoutRef.current) {
                                                clearTimeout(
                                                    copiedTimeoutRef.current,
                                                );
                                            }

                                            navigator.clipboard.writeText(
                                                process.env
                                                    .NEXT_PUBLIC_BASE_URL +
                                                    `/campaign/${campaign.id}/join/${invite.code}`,
                                            );

                                            setLinkCopied(true);

                                            copiedTimeoutRef.current =
                                                setTimeout(() => {
                                                    setLinkCopied(false);
                                                }, 3000);
                                        }}
                                    >
                                        <Icon
                                            icon={
                                                linkCopied
                                                    ? "mdi:check"
                                                    : "mdi:content-copy"
                                            }
                                            label="copy"
                                            className={clsx("h-4 w-4", {
                                                "text-green-500": linkCopied,
                                                "text-white": !linkCopied,
                                            })}
                                        />
                                    </button>
                                </>
                            ) : (
                                <Loader className="h-5 w-5" />
                            )}
                        </div>
                    </Dialog.Content.Body>
                </Dialog.Content>
            </Dialog>
        );
    },
);
