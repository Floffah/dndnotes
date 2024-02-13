import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { PropsWithChildren, forwardRef, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Dialog, DialogRef } from "@/app/components/Dialog";
import { Divider } from "@/app/components/Divider";
import { Form } from "@/app/components/Form";
import { Icon } from "@/app/components/Icon";
import { Link } from "@/app/components/Link";
import { User } from "@/app/components/User";
import { useCampaign } from "@/app/providers/CampaignProvider";
import { useUser } from "@/app/providers/UserProvider";
import { CampaignInvite } from "@/db/models/CampaignInvite";

const formSchema = z.object({
    userId: z.string(),
});
type FormValues = z.infer<typeof formSchema>;

export const CampaignInviteDialog = forwardRef<DialogRef, PropsWithChildren>(
    ({ children }, ref) => {
        const campaign = useCampaign();
        const user = useUser();

        const [invite, setInvite] = useState<CampaignInvite | null>(null);
        const [linkCopied, setLinkCopied] = useState(false);
        const copiedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

        const form = useForm<FormValues>({
            resolver: zodResolver(formSchema),
            defaultValues: {
                userId: undefined,
            },
        });

        const userId = form.watch("userId");

        const onSubmit = async (values: FormValues) => {
            setInvite(await campaign.inviteUser(values.userId));
        };

        return (
            <Dialog ref={ref}>
                <Dialog.Trigger>{children}</Dialog.Trigger>

                <Dialog.Overlay />
                <Dialog.Content className="max-w-md">
                    <Dialog.Content.Title>
                        Invite to Campaign
                    </Dialog.Content.Title>

                    {invite ? (
                        <>
                            <Dialog.Content.Description>
                                Send {invite.user.name} the link below.
                            </Dialog.Content.Description>

                            <Dialog.Content.Body>
                                <div className="flex items-center rounded-lg border border-gray-700 bg-gray-800 px-2 py-1 placeholder-white/40 outline-none ring-0 transition-colors duration-150 focus:ring-1 focus:ring-offset-0">
                                    <div className="flex-grow overflow-y-hidden overflow-x-scroll">
                                        {process.env.NEXT_PUBLIC_BASE_URL +
                                            `/campaign/${campaign.id}/join/${invite.code}`}
                                    </div>
                                    <Divider
                                        orientation="vertical"
                                        className="mx-1 h-full flex-shrink-0"
                                    />
                                    <button
                                        className="flex-shrink-0 px-1 transition-transform duration-150 hover:scale-110"
                                        onClick={() => {
                                            if (copiedTimeoutRef.current) {
                                                clearTimeout(
                                                    copiedTimeoutRef.current,
                                                );
                                            }

                                            navigator.clipboard.writeText(
                                                process.env
                                                    .NEXT_PUBLIC_BASE_URL +
                                                    `/campaign/${campaign.id}/join/${invite.code}`,
                                            );

                                            setLinkCopied(true);

                                            copiedTimeoutRef.current =
                                                setTimeout(() => {
                                                    setLinkCopied(false);
                                                }, 3000);
                                        }}
                                    >
                                        <Icon
                                            icon={
                                                linkCopied
                                                    ? "mdi:check"
                                                    : "mdi:content-copy"
                                            }
                                            label="copy"
                                            className={clsx("h-4 w-4", {
                                                "text-green-500": linkCopied,
                                                "text-white": !linkCopied,
                                            })}
                                        />
                                    </button>
                                </div>
                            </Dialog.Content.Body>
                        </>
                    ) : (
                        <>
                            <Dialog.Content.Description>
                                You can invite friends to your campaign. You
                                need to add them as a friend first, you can do
                                so on the <Link href="/">home page</Link>
                            </Dialog.Content.Description>

                            <Form.Provider form={form} submitHandler={onSubmit}>
                                <Dialog.Content.Body>
                                    <Form.Field name="userId" label="User">
                                        <div className="max-h-40 w-full overflow-y-scroll rounded-lg border border-white/5">
                                            {user.friends.map((friend) => {
                                                const otherUser =
                                                    friend.recipient.id ===
                                                    user.id
                                                        ? friend.sender
                                                        : friend.recipient;

                                                return (
                                                    <User
                                                        user={otherUser}
                                                        key={friend.id}
                                                    >
                                                        <button
                                                            key={friend.id}
                                                            className="flex w-full items-center gap-2 px-4 py-1.5 transition-colors duration-100 hover:bg-white/10"
                                                            onClick={() => {
                                                                form.setValue(
                                                                    "userId",
                                                                    otherUser.id,
                                                                );
                                                            }}
                                                        >
                                                            <User.Avatar />
                                                            <User.Name />

                                                            <div className="flex-1" />

                                                            <div
                                                                className={clsx(
                                                                    "flex h-5 w-5 items-center justify-center rounded-full",
                                                                    {
                                                                        "bg-green-500":
                                                                            userId ===
                                                                            otherUser.id,
                                                                        "border border-white/10":
                                                                            userId !==
                                                                            otherUser.id,
                                                                    },
                                                                )}
                                                            >
                                                                {userId ===
                                                                    otherUser.id && (
                                                                    <Icon
                                                                        label="checkmark"
                                                                        icon="mdi:check"
                                                                        className="h-3 w-3 text-white"
                                                                    />
                                                                )}
                                                            </div>
                                                        </button>
                                                    </User>
                                                );
                                            })}
                                        </div>
                                    </Form.Field>
                                </Dialog.Content.Body>

                                <Dialog.Content.Footer>
                                    <Form.Button size="md" color="primary">
                                        Invite
                                    </Form.Button>
                                </Dialog.Content.Footer>
                            </Form.Provider>
                        </>
                    )}
                </Dialog.Content>
            </Dialog>
        );
    },
);
