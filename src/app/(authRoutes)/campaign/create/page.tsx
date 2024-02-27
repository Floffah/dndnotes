"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form } from "@/app/components/Form";
import { trpc } from "@/app/lib/api/trpc";

const formSchema = z.object({
    name: z.string().min(3).max(100),
});
type FormValues = z.infer<typeof formSchema>;

export default function CampaignCreatePage() {
    const router = useRouter();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "My Campaign",
        },
    });

    const createCampaign = trpc.campaign.create.useMutation();

    const onSubmit = async (values: FormValues) => {
        router.prefetch("/campaign/[campaignId]");

        const campaign = await createCampaign.mutateAsync({
            ...values,
        });

        router.push(`/campaign/${campaign.id}`);
    };

    return (
        <div className="flex justify-center p-3">
            <main className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-white/10 bg-white/5 p-3">
                <h1 className="text-xl font-bold">Create Campaign</h1>

                <Form
                    form={form}
                    submitHandler={onSubmit}
                    className="flex flex-col gap-4"
                >
                    <Form.Input name="name" label="Campaign Name" />

                    <p className="w-full text-center text-sm text-white/80">
                        More options in the future. Consult the{" "}
                        <Link href="/docs/roadmap" className="text-blue-400">
                            the roadmap
                        </Link>
                    </p>

                    <Form.Button size="md" color="primary">
                        Create Campaign
                    </Form.Button>
                </Form>
            </main>
        </div>
    );
}
