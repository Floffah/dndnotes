"use client";

import { ComponentProps, useContext } from "react";
import { UseFormReturn } from "react-hook-form";

import { Button } from "@/app/components/Button";
import { FormContext } from "@/app/components/Form/index";

export function FormButton(props: ComponentProps<typeof Button>) {
    const { form } = useContext(FormContext);

    return (
        <Button
            {...props}
            type="submit"
            loading={form.formState.isSubmitting || props.loading}
        />
    );
}
