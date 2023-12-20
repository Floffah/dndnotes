"use client";

import { ComponentProps, useContext } from "react";
import { Controller } from "react-hook-form";

import { FormField } from "@/app/components/Form/FormField";
import { FormContext } from "@/app/components/Form/index";
import { Switch } from "@/app/components/Switch";

interface FormSwitchProps extends ComponentProps<typeof Switch> {
    name: string;
    label: string;
    description?: string;
}

export function FormSwitch({
    name,
    label,
    description,
    disabled,
    ...props
}: FormSwitchProps) {
    const { form } = useContext(FormContext);

    return (
        <FormField
            name={name}
            label={label}
            description={description}
            orientation="horizontal"
        >
            <Controller
                render={({ field: { ref, value, onChange, ...field } }) => (
                    <Switch
                        {...props}
                        {...field}
                        ref={ref}
                        checked={value}
                        onCheckedChange={(checked) => onChange(checked)}
                        disabled={
                            form.formState?.isSubmitting ||
                            disabled ||
                            field.disabled
                        }
                    />
                )}
                name={name}
                control={form.control}
                disabled={disabled}
            />
        </FormField>
    );
}
