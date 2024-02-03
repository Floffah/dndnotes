import { zodResolver } from "@hookform/resolvers/zod";
import { PropsWithChildren, forwardRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Dialog, DialogRef } from "@/app/components/Dialog";
import { Form } from "@/app/components/Form";
import { Link } from "@/app/components/Link";
import { useCampaign } from "@/app/providers/CampaignProvider";
import { CampaignSessionType } from "@/db/enums/CampaignSessionType";
import { CampaignSessionSchedule } from "@/db/models/CampaignSessionSchedule";

const formSchema = z.object({
    name: z.string(),
    type: z.nativeEnum(CampaignSessionType),
});
type FormValues = z.infer<typeof formSchema>;

export const StartSessionDialog = forwardRef<
    DialogRef,
    PropsWithChildren<{ schedule?: CampaignSessionSchedule }>
>(({ schedule, children }, ref) => {
    const campaign = useCampaign();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: schedule?.name ?? `Session ${campaign.totalSessions + 1}`,
        },
    });

    const onSubmit = async (values: FormValues) => {};

    return (
        <Dialog ref={ref}>
            <Dialog.Trigger asChild>{children}</Dialog.Trigger>

            <Dialog.Overlay />

            <Dialog.Content className="max-w-md">
                <Dialog.Content.Title>Start Session</Dialog.Content.Title>

                <Dialog.Content.Description>
                    {schedule ? (
                        `This will create a session associated with the schedule '${schedule.name}'`
                    ) : (
                        <>
                            Note that this will create a standalone session, not
                            associated with a schedule. Need to schedule a
                            session?{" "}
                            <Link
                                href={`/campaign/${campaign.id}/schedule`}
                                label="Campaign settings"
                            >
                                Create a schedule
                            </Link>
                        </>
                    )}
                </Dialog.Content.Description>

                <Form.Provider form={form} onSubmit={onSubmit}>
                    <Dialog.Content.Body>
                        <Form.Root>
                            <Form.Input name="name" label="Session name" />
                        </Form.Root>
                    </Dialog.Content.Body>

                    <Dialog.Content.Footer>
                        <Form.Button size="md" color="primary">
                            Start Session
                        </Form.Button>
                    </Dialog.Content.Footer>
                </Form.Provider>
            </Dialog.Content>
        </Dialog>
    );
});
