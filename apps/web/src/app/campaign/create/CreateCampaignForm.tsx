"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form } from "@dndnotes/components";

const formSchema = z.object({
    name: z.string(),
});
type FormValues = z.infer<typeof formSchema>;

export function CreateCampaignForm() {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "My Campaign",
        },
    });

    const onSubmit = (values: FormValues) => {
        console.log(values);
    };

    return (
        <section className="flex flex-col gap-2 rounded-lg bg-gray-800 p-2">
            <h1 className="text-2xl font-bold">Create a Campaign</h1>

            <Form form={form} submitHandler={onSubmit}>
                <Form.Input name="name" label="Campaign Name" />
            </Form>
        </section>
    );
}
