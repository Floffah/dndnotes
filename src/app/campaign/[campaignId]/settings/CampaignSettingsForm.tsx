"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { trpc } from "@/app/api/lib/client/trpc";
import { Form } from "@/app/components/Form";
import { useCache } from "@/app/providers/CacheProvider";
import { useCampaign } from "@/app/providers/CampaignProvider";
import { RepeatInterval } from "@/db/enums/RepeatInterval";

enum SessionLength {
    THIRTY_MINUTES = "THIRTY_MINUTES",
    ONE_HOUR = "ONE_HOUR",
    TWO_HOURS = "TWO_HOURS",
    THREE_HOURS = "THREE_HOURS",
    INDEFINITE = "INDEFINITE",
}

const sessionLengths = {
    [SessionLength.THIRTY_MINUTES]: 30 * 60 * 1000,
    [SessionLength.ONE_HOUR]: 60 * 60 * 1000,
    [SessionLength.TWO_HOURS]: 2 * 60 * 60 * 1000,
    [SessionLength.THREE_HOURS]: 3 * 60 * 60 * 1000,
    [SessionLength.INDEFINITE]: 2 * 60 * 60 * 1000,
};

const formSchema = z.object({
    name: z.string().min(5),

    schedule: z.object({
        manual: z.boolean().optional(),
        start: z.date(),
        repeat: z.nativeEnum(RepeatInterval),
        length: z.string(),

        nextSession: z.date(),
    }),
});
type FormValues = z.infer<typeof formSchema>;

export function CampaignSettingsForm() {
    const campaign = useCampaign();
    const cache = useCache();

    const updateCampaign = trpc.campaign.update.useMutation();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: campaign.name,
            schedule: {
                manual: campaign.schedule.manual,
                start: campaign.schedule.start ?? new Date(),
                repeat: campaign.schedule.repeat,
                length: campaign.schedule.length
                    ? Object.entries(sessionLengths).find(
                          ([, length]) => length === campaign.schedule.length,
                      )?.[0]
                    : SessionLength.TWO_HOURS,

                nextSession: campaign.schedule.nextSession ?? new Date(),
            },
        },
    });

    console.log(form.watch());

    const manualSchedule = form.watch("schedule.manual");

    const onSubmit = async (values: FormValues) => {
        const updatedCampaign = await updateCampaign.mutateAsync({
            id: campaign.id,
            name: values.name,
            schedule: {
                manual: values.schedule.manual,
                start: values.schedule.start?.toISOString(),
                repeat: values.schedule.repeat,
                length: sessionLengths[values.schedule.length as SessionLength],
                nextSession: values.schedule.nextSession?.toISOString(),
            },
        });

        cache.campaign.upsertCampaign(campaign.id, updatedCampaign);
    };

    return (
        <div className="flex h-full w-full flex-col items-center rounded-lg border border-white/10 bg-white/5">
            <div className="flex w-full max-w-md flex-col gap-4 pt-5">
                <h1 className="text-3xl font-bold">Campaign Settings</h1>

                <Form form={form} onSubmit={onSubmit}>
                    <h2 className="mb-3 border-b-2 border-b-white/20 text-2xl font-semibold">
                        General
                    </h2>

                    <Form.Input name="name" label="Campaign Name" />

                    <h2 className="mb-3 mt-5 border-b-2 border-b-white/20 text-2xl font-semibold">
                        Schedule
                    </h2>

                    <div className="flex flex-col gap-2">
                        <Form.Switch
                            name="schedule.manual"
                            label="Manually set next session"
                        />

                        {manualSchedule ? (
                            <Form.DateInput
                                name="schedule.nextSession"
                                label="Next session"
                            />
                        ) : (
                            <>
                                <Form.DateInput
                                    name="schedule.start"
                                    label="Date of first session"
                                />

                                <Form.Select
                                    name="schedule.repeat"
                                    label="Repeat interval"
                                >
                                    <Form.Select.Item
                                        value={RepeatInterval.WEEKLY}
                                    >
                                        Weekly
                                    </Form.Select.Item>
                                    <Form.Select.Item
                                        value={RepeatInterval.FORTNIGHTLY}
                                    >
                                        Fortnightly
                                    </Form.Select.Item>
                                    <Form.Select.Item
                                        value={RepeatInterval.MONTHLY}
                                    >
                                        Monthly
                                    </Form.Select.Item>
                                </Form.Select>

                                <Form.Select
                                    name="schedule.length"
                                    label="Session length"
                                >
                                    <Form.Select.Item
                                        value={SessionLength.THIRTY_MINUTES}
                                    >
                                        30 minutes
                                    </Form.Select.Item>
                                    <Form.Select.Item
                                        value={SessionLength.ONE_HOUR}
                                    >
                                        1 hour
                                    </Form.Select.Item>
                                    <Form.Select.Item
                                        value={SessionLength.TWO_HOURS}
                                    >
                                        2 hours
                                    </Form.Select.Item>
                                    <Form.Select.Item
                                        value={SessionLength.THREE_HOURS}
                                    >
                                        3 hours
                                    </Form.Select.Item>
                                    <Form.Select.Item
                                        value={SessionLength.INDEFINITE}
                                    >
                                        Indefinite
                                    </Form.Select.Item>
                                </Form.Select>
                            </>
                        )}
                    </div>

                    <Form.Button
                        size="md"
                        color="primary"
                        className="mt-5 w-full"
                    >
                        Save
                    </Form.Button>
                </Form>
            </div>
        </div>
    );
}
