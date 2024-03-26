import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { Form } from "@dndnotes/components";
import { FriendshipRequestError, UserError } from "@dndnotes/models";

import { useUser } from "@/app/providers/UserProvider";

const addFriendFormSchema = z.object({
    friendName: z.string().min(1),
});
type AddFriendFormValues = z.infer<typeof addFriendFormSchema>;

export function AddFriendForm() {
    const user = useUser();

    const addFriendForm = useForm<AddFriendFormValues>({
        resolver: zodResolver(addFriendFormSchema),
    });

    const [addFriendSubmitted, setAddFriendSubmitted] = useState(false);

    const onSubmitAddFriend: SubmitHandler<AddFriendFormValues> = async (
        values,
    ) => {
        try {
            await user.addFriend(values.friendName);
        } catch (e: any) {
            switch (e.message) {
                case UserError.NOT_FOUND:
                    addFriendForm.setError("friendName", {
                        message: "User not found",
                    });
                    return;
                case FriendshipRequestError.REQUEST_ALREADY_SENT:
                    addFriendForm.setError("friendName", {
                        message: "Request already sent",
                    });
                    return;
            }
        }

        addFriendForm.reset();
        setAddFriendSubmitted(true);
    };

    return (
        <Form
            form={addFriendForm}
            submitHandler={onSubmitAddFriend}
            className="flex w-full gap-1"
        >
            <Form.Input
                name="friendName"
                placeholder="Add friend"
                fieldClassName="flex-1"
                onClick={() => setAddFriendSubmitted(false)}
            />
            <Form.Button size="sm" color="primary" className="!h-[2.125rem]">
                {addFriendSubmitted ? "Sent!" : "Add"}
            </Form.Button>
        </Form>
    );
}
