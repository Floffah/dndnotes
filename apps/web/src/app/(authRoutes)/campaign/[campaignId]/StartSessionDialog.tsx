import { Dialog, DialogRef, Form, Link } from "@dndnotes/components";
import { CampaignSessionSchedule, CampaignSessionType } from "@dndnotes/models";
import { zodResolver } from "@hookform/resolvers/zod";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { PropsWithChildren, forwardRef, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useCampaign } from "@/app/providers/CampaignProvider";

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

    const dialogRef = useRef<DialogRef>(null);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: schedule?.name ?? `Session ${campaign.totalSessions + 1}`,
            type: schedule?.type ?? CampaignSessionType.ONE_SHOT,
        },
    });

    const sessionType = form.watch("type");

    const onSubmit = async (values: FormValues) => {
        await campaign.startSession({
            campaignId: campaign.id,
            name: values.name,
            scheduleId: schedule?.id,
            type: values.type,
        });

        dialogRef.current?.close();
    };

    return (
        <Dialog ref={composeRefs(ref, dialogRef)}>
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
                            associated with a schedule. Want to schedule a
                            session instead?{" "}
                            <Link
                                href={`/campaign/${campaign.id}/settings#schedules`}
                                label="Campaign settings"
                            >
                                Create a schedule
                            </Link>
                        </>
                    )}
                </Dialog.Content.Description>

                <Form.Provider form={form} submitHandler={onSubmit}>
                    <Dialog.Content.Body>
                        <Form.Root className="flex w-full flex-col gap-2">
                            <Form.Input
                                name="name"
                                label="Session name"
                                description="This can be changed later!"
                            />

                            {!schedule && (
                                <Form.Select
                                    name="type"
                                    label="Session type"
                                    warning={
                                        sessionType ===
                                            CampaignSessionType.ONGOING &&
                                        !schedule &&
                                        "Note that this will not be part of any recurring schedule. Are you sure this is part of an ongoing campaign?"
                                    }
                                >
                                    <Form.Select.Item
                                        value={CampaignSessionType.ONE_SHOT}
                                    >
                                        One Shot
                                    </Form.Select.Item>
                                    <Form.Select.Item
                                        value={CampaignSessionType.ONGOING}
                                    >
                                        Part of an ongoing campaign
                                    </Form.Select.Item>
                                </Form.Select>
                            )}
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
