"use client";

import clsx from "clsx";
import { PropsWithChildren, forwardRef } from "react";

import {
    Button,
    Dialog,
    DialogRef,
    Loader,
    useDialogs,
} from "@dndnotes/components";
import { CampaignFilter } from "@dndnotes/server";

import { api } from "@/lib/api";
import { useDiscord } from "@/providers/DiscordProvider";
import { useGuildCampaigns } from "@/providers/GuildCampaignsProvider";

export const LinkCampaignDialog = forwardRef<DialogRef, PropsWithChildren>(
    ({ children }, ref) => {
        const discord = useDiscord();
        const dialogs = useDialogs();
        const guildCampaigns = useGuildCampaigns();

        const campaigns = api.campaign.list.useQuery({
            filter: CampaignFilter.CREATED,
        });

        return (
            <Dialog ref={ref} open={true}>
                <Dialog.Trigger asChild>{children}</Dialog.Trigger>
                <Dialog.Content className="max-w-sm">
                    {({ close }) => (
                        <>
                            <Dialog.Content.Title>
                                Link Campaign
                            </Dialog.Content.Title>
                            <Dialog.Content.Description>
                                To link a campaign, you must own it.
                            </Dialog.Content.Description>

                            <Dialog.Content.Body
                                className={clsx({
                                    "my-5 flex w-full items-center justify-center px-8 text-center text-sm text-white/80":
                                        campaigns.isLoading ||
                                        campaigns.data?.length === 0,
                                    "flex flex-col gap-2":
                                        campaigns.data &&
                                        campaigns.data.length > 0,
                                })}
                            >
                                {campaigns.isLoading && (
                                    <>
                                        <p>Fetching campaigns...</p>
                                        <Loader />
                                    </>
                                )}

                                {campaigns.data?.length === 0 && (
                                    <p>
                                        You don&apos;t own any campaigns.
                                        <br /> Create one on{" "}
                                        <a
                                            className="cursor-pointer text-blue-500 underline"
                                            onClick={() =>
                                                discord.sdk.commands.openExternalLink(
                                                    {
                                                        url: "https://dndnotes.floffah.dev",
                                                    },
                                                )
                                            }
                                        >
                                            DNDNotes
                                        </a>
                                    </p>
                                )}

                                {campaigns.data && (
                                    <div className="mx-auto flex w-full max-w-xs flex-col justify-center gap-2 px-4">
                                        {campaigns.data?.map((campaign) => (
                                            <Button
                                                size="sm"
                                                color={
                                                    campaign.isLinkedToGuild
                                                        ? "secondary"
                                                        : "primary"
                                                }
                                                key={campaign.id}
                                                onClick={async () => {
                                                    if (
                                                        campaign.isLinkedToGuild
                                                    ) {
                                                        const confirmationResult =
                                                            await dialogs.showConfirmation(
                                                                {
                                                                    title: "Relink Campaign?",
                                                                    description:
                                                                        "This campaign is already linked to another discord server. Are you sure you want to relink it?",
                                                                },
                                                            );

                                                        if (
                                                            !confirmationResult
                                                        ) {
                                                            return;
                                                        }
                                                    }

                                                    await guildCampaigns.linkCampaign(
                                                        campaign.id,
                                                    );

                                                    close();
                                                }}
                                            >
                                                Link
                                                <span className="font-bold">
                                                    {campaign.name}
                                                </span>
                                                {campaign.isLinkedToGuild && (
                                                    <span className="text-xs text-white/80">
                                                        (Already linked)
                                                    </span>
                                                )}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </Dialog.Content.Body>
                        </>
                    )}
                </Dialog.Content>
            </Dialog>
        );
    },
);
