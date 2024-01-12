import { zodResolver } from "@hookform/resolvers/zod";
import { PropsWithChildren, forwardRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { trpc } from "@/app/api/lib/client/trpc";
import { Dialog, DialogRef } from "@/app/components/Dialog";
import { Form } from "@/app/components/Form";
import { useCampaign } from "@/app/providers/CampaignProvider";
import { CampaignSessionType } from "@/db/enums/CampaignSessionType";

const formSchema = z.object({
    name: z.string(),
    type: z.nativeEnum(CampaignSessionType),
});
type FormValues = z.infer<typeof formSchema>;

export const StartSessionDialog = forwardRef<DialogRef, PropsWithChildren>(
    ({ children }, ref) => {
        const campaign = useCampaign();

        const isSessionNow =
            campaign.schedule.nextSession &&
            Date.now() > campaign.schedule.nextSession.getTime();

        const form = useForm({
            resolver: zodResolver(formSchema),
            defaultValues: {
                name: `Session ${campaign.totalSessions + 1}`,
                type: isSessionNow
                    ? CampaignSessionType.ONGOING
                    : CampaignSessionType.ONE_SHOT,
            },
        });

        const createSessionMutation =
            trpc.campaign.session.create.useMutation();

        const onSubmit = async (values: FormValues) => {
            await createSessionMutation.mutateAsync({
                campaignId: campaign.id,
                name: values.name,
                type: values.type,
            });
        };

        return (
            <Dialog ref={ref}>
                <Dialog.Trigger asChild>{children}</Dialog.Trigger>

                <Dialog.Content className="max-w-md">
                    <Dialog.Content.Title>Start Session</Dialog.Content.Title>

                    <Dialog.Content.Body>
                        <Form form={form} onSubmit={onSubmit}>
                            <Form.Input name="name" label="Session name" />
                            <Form.Select name="type" label="Session type">
                                <option value={CampaignSessionType.ONE_SHOT}>
                                    One Shot
                                </option>
                                <option value={CampaignSessionType.ONGOING}>
                                    Ongoing
                                </option>
                            </Form.Select>

                            <Form.Button size="md" color="primary">
                                Start Session
                            </Form.Button>
                        </Form>
                    </Dialog.Content.Body>
                </Dialog.Content>
            </Dialog>
        );
    },
);
