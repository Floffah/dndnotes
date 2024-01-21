import { zodResolver } from "@hookform/resolvers/zod";
import { PropsWithChildren, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { trpc } from "@/app/api/lib/client/trpc";
import { Button } from "@/app/components/Button";
import { Dialog, DialogRef } from "@/app/components/Dialog";
import { Form } from "@/app/components/Form";
import { useCampaign } from "@/app/providers/CampaignProvider";
import { CampaignSessionType } from "@/db/enums/CampaignSessionType";
import { RepeatInterval } from "@/db/enums/RepeatInterval";

const formSchema = z.object({
    name: z.string(),
    type: z.nativeEnum(CampaignSessionType),

    firstSessionAt: z.date(),
    doesRepeat: z.boolean(),
    repeat: z.nativeEnum(RepeatInterval).optional(),
    length: z.number().min(0).max(60).optional(), // millis
    lengthUnit: z.enum(["minutes", "hours"]).optional(),
});
type FormValues = z.infer<typeof formSchema>;

export function AddScheduleDialog({ children }: PropsWithChildren) {
    const campaign = useCampaign();

    const createSchedule = trpc.campaign.session.createSchedule.useMutation();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "Main Schedule",
            type: CampaignSessionType.ONGOING,
            firstSessionAt: new Date(),
            doesRepeat: false,
            repeat: RepeatInterval.WEEKLY,
            length: 2,
            lengthUnit: "hours",
        } as FormValues,
    });

    const doesRepeat = form.watch("doesRepeat");

    const dialogRef = useRef<DialogRef>(null);

    const onSubmit = async (values: FormValues) => {
        const createScheduleInput = {
            campaignId: campaign.id,
            name: values.name,
            type: values.type,
            firstSessionAt: values.firstSessionAt,
            repeat: values.doesRepeat ? values.repeat : undefined,
            length: 0,
        };

        if (values.doesRepeat) {
            let length = values.length!;

            if (values.lengthUnit === "hours") {
                length *= 60 * 60 * 1000;
            } else {
                length *= 60 * 1000;
            }

            createScheduleInput.length = length;
        }

        const schedule = await createSchedule.mutateAsync(createScheduleInput);

        form.reset();
        dialogRef.current?.close();
    };

    return (
        <Dialog ref={dialogRef}>
            <Dialog.Trigger asChild>{children}</Dialog.Trigger>
            <Dialog.Content className="max-w-md">
                <Dialog.Content.Title>Add Schedule</Dialog.Content.Title>
                <Dialog.Content.Description>
                    You can add multiple schedules to your campaign.
                </Dialog.Content.Description>
                <Dialog.Content.Body className="max-h-96 overflow-y-auto">
                    <Form
                        form={form}
                        onSubmit={onSubmit}
                        className="my-1 flex flex-col gap-3 px-3"
                    >
                        <Form.Input name="name" label="Name" />

                        <Form.Select
                            name="type"
                            label="Type"
                            description="The schedule's type determines how it will be used."
                        >
                            <Form.Select.Item
                                value={CampaignSessionType.ONGOING}
                            >
                                Ongoing
                            </Form.Select.Item>
                            <Form.Select.Item
                                value={CampaignSessionType.ONE_SHOT}
                            >
                                One shot
                            </Form.Select.Item>
                        </Form.Select>

                        <Form.DateInput
                            name="firstSessionAt"
                            label="First session date"
                            description="The date of the first session. Repeats will be calculated from this date."
                        />

                        <Form.Switch
                            name="doesRepeat"
                            label="Does repeat"
                            description="If enabled, the schedule will automatically repeat."
                        />

                        {doesRepeat && (
                            <>
                                <Form.Select
                                    name="repeat"
                                    label="Repeat"
                                    description="The interval at which the schedule will repeat."
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

                                <div className="flex gap-2">
                                    <Form.Input
                                        name="length"
                                        label="Length"
                                        className="flex-1"
                                    />

                                    <Form.Select
                                        name="lengthUnit"
                                        label="Unit"
                                        fieldClassName="flex-1"
                                    >
                                        <Form.Select.Item value="minutes">
                                            Minutes
                                        </Form.Select.Item>
                                        <Form.Select.Item value="hours">
                                            Hours
                                        </Form.Select.Item>
                                    </Form.Select>
                                </div>
                            </>
                        )}
                    </Form>
                </Dialog.Content.Body>

                <Dialog.Content.Footer className="px-3">
                    <Dialog.Content.Footer.Button size="md" color="secondary">
                        Cancel
                    </Dialog.Content.Footer.Button>
                    <Button
                        size="md"
                        color="primary"
                        onClick={form.handleSubmit(onSubmit)}
                    >
                        Create
                    </Button>
                </Dialog.Content.Footer>
            </Dialog.Content>
        </Dialog>
    );
}
