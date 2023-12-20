"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { trpc } from "@/app/api/lib/client/trpc";
import { Form } from "@/app/components/Form";
import { useCampaign } from "@/app/providers/CampaignProvider";

const formSchema = z.object({
    name: z.string().min(5),

    schedule: z.object({
        manual: z.boolean().optional(),
        // start: z.date(),
        // repeat: z.nativeEnum(RepeatInterval),
        // dayOfWeek: z.array(z.number().min(0).max(6)),

        nextSession: z.date(),
    }),
});
type FormValues = z.infer<typeof formSchema>;

export function CampaignSettingsForm() {
    const campaign = useCampaign();
    const trpcUtils = trpc.useUtils();

    const updateCampaign = trpc.campaign.update.useMutation();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: campaign.name,
            schedule: {
                manual: true, // campaign.schedule.manual,
                // start: campaign.schedule.start,
                // repeat: campaign.schedule.repeat,
                // dayOfWeek: campaign.schedule.dayOfWeek,

                nextSession: campaign.schedule.nextSession ?? new Date(),
            },
        },
    });

    const onSubmit = async (values: FormValues) => {
        const updatedCampaign = await updateCampaign.mutateAsync({
            id: campaign.id,
            name: values.name,
            schedule: {
                manual: true, //values.schedule.manual,
                // start: values.schedule.start?.toISOString(),
                // repeat: values.schedule.repeat,
                // dayOfWeek: values.schedule.dayOfWeek,
                nextSession: values.schedule.nextSession?.toISOString(),
            },
        });

        trpcUtils.campaign.get.setData(updatedCampaign.id, updatedCampaign);
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
                            disabled
                        />

                        <Form.DateInput
                            name="schedule.nextSession"
                            label="Next session"
                        />
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
