"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { CampaignSchedules } from "@/app/(authRoutes)/campaign/[campaignId]/settings/CampaignSettingsForm/CampaignSchedules";
import { Form } from "@/app/components/Form";
import { useCampaign } from "@/app/providers/CampaignProvider";

const formSchema = z.object({
    name: z.string().min(5),
});
type FormValues = z.infer<typeof formSchema>;

export function CampaignSettingsForm() {
    const campaign = useCampaign();

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
        <div className="flex h-full w-full flex-col items-center rounded-lg border border-white/10 bg-white/5">
            <div className="flex w-full max-w-md flex-col gap-4 pt-5">
                <h1 className="text-3xl font-bold">Campaign Settings</h1>

                <Form form={form} submitHandler={onSubmit}>
                    <h2 className="mb-3 border-b-2 border-b-white/20 text-2xl font-semibold">
                        General
                    </h2>

                    <Form.Input name="name" label="Campaign Name" />

                    <CampaignSchedules />

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
