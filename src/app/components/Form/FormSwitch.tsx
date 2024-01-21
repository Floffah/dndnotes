"use client";

import { ComponentProps, useContext } from "react";
import { Controller } from "react-hook-form";

import {
    FormField,
    FormFieldBaseProps,
    useFormField,
} from "@/app/components/Form/FormField";
import { FormContext } from "@/app/components/Form/index";
import { Switch } from "@/app/components/Switch";

type Base = ComponentProps<typeof Switch> & FormFieldBaseProps;
interface FormSwitchProps extends Base {
    name: string;
    label: string;
    description?: string;
}

export function FormSwitch({ ...props }: FormSwitchProps) {
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
