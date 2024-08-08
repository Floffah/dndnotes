"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form } from "@dndnotes/components";

import { api } from "@/lib/api";

const formSchema = z.object({
    name: z.string(),
});
type FormValues = z.infer<typeof formSchema>;

export function CreateCampaignForm() {
    const router = useRouter();

    const createCampaignMutation = api.campaign.create.useMutation();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "My Campaign",
        },
    });

    const onSubmit = async (values: FormValues) => {
        const publicId = await createCampaignMutation.mutateAsync(values);

        router.push(`/campaign/${publicId}`);
    };

    return (
        <section className="flex flex-col gap-4 rounded-lg bg-gray-800 p-4">
            <h1 className="text-2xl font-bold">Create a Campaign</h1>

            <Form
                form={form}
                submitHandler={onSubmit}
                className="flex flex-col gap-4"
            >
                <Form.Input name="name" label="Campaign Name" />

                <Form.Button size="md" color="primary" className="px-6">
                    Create
                </Form.Button>
            </Form>
        </section>
    );
}
