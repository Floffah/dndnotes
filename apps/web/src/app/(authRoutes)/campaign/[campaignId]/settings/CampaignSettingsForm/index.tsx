"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button, Form, Tooltip, useDialogs } from "@dndnotes/components";

import { CampaignSchedules } from "@/app/(authRoutes)/campaign/[campaignId]/settings/CampaignSettingsForm/CampaignSchedules";
import { api } from "@/app/lib/api";
import { useCampaign } from "@/app/providers/CampaignProvider";

const formSchema = z.object({
    name: z.string().min(5),
});
type FormValues = z.infer<typeof formSchema>;

export function CampaignSettingsForm() {
    const campaign = useCampaign();
    const dialogs = useDialogs();

    const unlinkGuildsMutation = api.campaign.unlinkGuilds.useMutation();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: campaign.name,
        },
    });

    const onSubmit = async (values: FormValues) => {
        await campaign.update(campaign.id, {
            name: values.name,
        });
    };

    return (
        <main className="flex h-full w-full flex-col items-center rounded-lg border border-white/10 bg-white/5">
            <div className="flex w-full max-w-md flex-col gap-4 pt-5">
                <h1 className="text-3xl font-bold">Campaign Settings</h1>

                <Form form={form} submitHandler={onSubmit}>
                    <h2 className="mb-3 border-b-2 border-b-white/20 text-2xl font-semibold">
                        General
                    </h2>

                    <Form.Input name="name" label="Campaign Name" />

                    <CampaignSchedules />

                    <h2 className="mb-3 mt-5 border-b-2 border-b-white/20 text-2xl font-semibold">
                        Discord
                    </h2>

                    {campaign.isLinkedToGuild ? (
                        <div className="flex w-full items-center rounded-lg bg-black/20 px-3 py-2">
                            <p className="flex-1">
                                This campaign has been linked to Discord
                            </p>
                            <Button
                                size="sm"
                                color="primary"
                                className="flex-shrink-0"
                                type="button"
                                onClick={async () => {
                                    if (
                                        await dialogs.showConfirmation({
                                            title: "Are you sure?",
                                            description:
                                                "This will unlink the campaign from the Discord server it's currently linked to. You won't lose any data, but you will need to link it again to be able to use this campaign inside the Discord Embedded App.",
                                        })
                                    ) {
                                        await unlinkGuildsMutation.mutateAsync({
                                            campaignId: campaign.id,
                                        });
                                    }
                                }}
                            >
                                Unlink
                            </Button>
                        </div>
                    ) : (
                        <Tooltip title="The DNDNotes Discord Embedded App is still in development">
                            <div className="flex w-full items-center rounded-lg bg-gray-900/70 px-3 py-2">
                                <p className="flex-1">
                                    This campaign is not linked to a Discord
                                    server
                                </p>
                                <Button
                                    size="sm"
                                    color="primary"
                                    className="flex-shrink-0"
                                    disabled
                                >
                                    Open Discord
                                </Button>
                            </div>
                        </Tooltip>
                    )}

                    <Form.Button
                        size="md"
                        color="primary"
                        className="mt-5 w-full"
                    >
                        Save
                    </Form.Button>
                </Form>
            </div>
        </main>
    );
}
