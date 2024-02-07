import { zodResolver } from "@hookform/resolvers/zod";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { PropsWithChildren, forwardRef, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Dialog, DialogRef } from "@/app/components/Dialog";
import { Form } from "@/app/components/Form";
import { useCampaign } from "@/app/providers/CampaignProvider";
import { useCampaignSession } from "@/app/providers/CampaignSessionProvider";

const formSchema = z.object({
    notionLink: z.string().min(10),
});
type FormValues = z.infer<typeof formSchema>;

export const LinkToNotionDialog = forwardRef<DialogRef, PropsWithChildren>(
    ({ children }, externalRef) => {
        const campaign = useCampaign();
        const session = useCampaignSession();

        const dialogRef = useRef<DialogRef>(null);

        const form = useForm({
            resolver: zodResolver(formSchema),
            defaultValues: {
                notionLink: undefined,
            },
        });

        const onSubmit = async (values: FormValues) => {
            let notionId = values.notionLink;

            if (notionId.includes("notion.site")) {
                const url = new URL(notionId);

                const id = url.pathname.split("-").pop();

                if (id) {
                    notionId = id;
                }
            }

            await session.updateSummary({
                campaignId: campaign.id,
                sessionId: session.id,
                notionId: notionId,
            });

            dialogRef.current?.close();
        };

        return (
            <Dialog ref={composeRefs(dialogRef, externalRef)}>
                <Dialog.Trigger asChild>{children}</Dialog.Trigger>
                <Dialog.Overlay />
                <Dialog.Content className="max-w-md">
                    <Dialog.Content.Title>Link to Notion</Dialog.Content.Title>
                    <Dialog.Content.Description>
                        Don&apos;t know how to do this?
                        <br />
                        Open your page on Notion, click on the share button, go
                        to publish, and copy the link.
                        <br />
                        This can be changed later.
                    </Dialog.Content.Description>

                    <Form.Provider form={form} submitHandler={onSubmit}>
                        <Dialog.Content.Body>
                            <Form.Root>
                                <Form.Input
                                    name="notionLink"
                                    label="Notion Link or ID"
                                />
                            </Form.Root>
                        </Dialog.Content.Body>

                        <Dialog.Content.Footer>
                            <Form.Button size="md" color="primary">
                                Link
                            </Form.Button>
                        </Dialog.Content.Footer>
                    </Form.Provider>
                </Dialog.Content>
            </Dialog>
        );
    },
);
