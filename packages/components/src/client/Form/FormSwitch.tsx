"use client";

import { ComponentProps, useContext } from "react";
import { Controller } from "react-hook-form";

import {
    FormField,
    FormFieldBaseProps,
    useFormField,
} from "@/client/Form/FormField";
import { FormContext } from "@/client/Form/index";
import { Switch } from "@/client/Switch";

type BaseFormSwitchProps = ComponentProps<typeof Switch> & FormFieldBaseProps;

interface FormSwitchProps extends BaseFormSwitchProps {
    name: string;
    label: string;
    description?: string;
}

export function FormSwitch({ ...props }: FormSwitchProps) {
    "use client";

    const { form } = useContext(FormContext);

    const {
        fieldProps,
        controlProps: { name, disabled, ...controlProps },
    } = useFormField(props, {
        defaultOrientation: "horizontal",
        defaultPosition: "end",
    });

    return (
        <FormField {...fieldProps}>
            <Controller
                render={({ field: { ref, value, onChange, ...field } }) => (
                    <Switch
                        {...props}
                        {...field}
                        ref={ref}
                        checked={value}
                        name={name}
                        onCheckedChange={(checked) => onChange(checked)}
                    />
                )}
                name={name}
                control={form.control}
                disabled={disabled}
            />
        </FormField>
    );
}
