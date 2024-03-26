import { zodResolver } from "@hookform/resolvers/zod";
import { PropsWithChildren, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button, Dialog, DialogRef, Form } from "@dndnotes/components";
import { CampaignSessionType, RepeatInterval } from "@dndnotes/models";

import { useCampaign } from "@/app/providers/CampaignProvider";

const formSchema = z.object({
    name: z.string(),
    type: z.nativeEnum(CampaignSessionType),

    firstSessionAt: z.date(),
    repeat: z.enum(["NONE", ...Object.keys(RepeatInterval)]).optional(),
    length: z.number().min(0).max(60).optional(), // millis
    lengthUnit: z.enum(["minutes", "hours"]).optional(),
});
type FormValues = z.infer<typeof formSchema>;

export function AddScheduleDialog({ children }: PropsWithChildren) {
    const campaign = useCampaign();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "Main Schedule",
            type: CampaignSessionType.ONGOING,
            firstSessionAt: new Date(),
            repeat: "NONE",
            length: 2,
            lengthUnit: "hours",
        } as FormValues,
    });

    const dialogRef = useRef<DialogRef>(null);

    const onSubmit = async (values: FormValues) => {
        const createScheduleInput = {
            campaignId: campaign.id,
            name: values.name,
            type: values.type,
            firstSessionAt: values.firstSessionAt,
            repeat:
                values.repeat !== "NONE"
                    ? (values.repeat as RepeatInterval)
                    : undefined,
            length: 0,
        };

        let length = values.length!;

        if (values.lengthUnit === "hours") {
            length *= 60 * 60 * 1000;
        } else {
            length *= 60 * 1000;
        }

        createScheduleInput.length = length;

        await campaign.createSchedule(createScheduleInput);

        form.reset();
        dialogRef.current?.close();
    };

    return (
        <Dialog ref={dialogRef}>
            <Dialog.Trigger asChild>{children}</Dialog.Trigger>
            <Dialog.Overlay />
            <Dialog.Content className="max-w-md">
                <Dialog.Content.Title>Add Schedule</Dialog.Content.Title>
                <Dialog.Content.Description>
                    You can add multiple schedules to your campaign.
                </Dialog.Content.Description>
                <Dialog.Content.Body className="max-h-96 overflow-y-auto">
                    <Form
                        form={form}
                        submitHandler={onSubmit}
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

                        <Form.Select
                            name="repeat"
                            label="Repeat"
                            description="The interval at which the schedule will repeat."
                        >
                            <Form.Select.Item value={"NONE"}>
                                No repeat
                            </Form.Select.Item>
                            <Form.Select.Item value={RepeatInterval.WEEKLY}>
                                Weekly
                            </Form.Select.Item>
                            <Form.Select.Item
                                value={RepeatInterval.FORTNIGHTLY}
                            >
                                Fortnightly
                            </Form.Select.Item>
                            <Form.Select.Item value={RepeatInterval.MONTHLY}>
                                Monthly
                            </Form.Select.Item>
                        </Form.Select>
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
