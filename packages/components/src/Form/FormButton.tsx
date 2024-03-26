"use client";

import { composeRefs } from "@radix-ui/react-compose-refs";
import {
    ComponentProps,
    ComponentRef,
    forwardRef,
    useContext,
    useMemo,
    useRef,
} from "react";

import { Button } from "@/Button";
import { FormContext } from "@/Form/index";

export const FormButton = forwardRef<
    ComponentRef<typeof Button>,
    ComponentProps<typeof Button>
>(({ onClick, ...props }, externalRef) => {
    "use client";

    const { form, submit } = useContext(FormContext);

    const buttonRef = useRef<ComponentRef<typeof Button>>(null);

    const isInsideForm = useMemo(() => {
        const closestForm = buttonRef.current?.closest("form");

        return !!closestForm;
    }, [buttonRef]);

    return (
        <Button
            {...props}
            type="submit"
            loading={form.formState.isSubmitting || props.loading}
            ref={composeRefs(externalRef, buttonRef)}
            onClick={
                onClick ??
                (async (e) => {
                    if (
                        !isInsideForm &&
                        props.type !== "button" &&
                        props.type !== "reset"
                    ) {
                        await submit(e);
                    }
                })
            }
        />
    );
});
