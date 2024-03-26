"use client";

import { ComponentProps, useContext } from "react";
import { Controller } from "react-hook-form";

import { FormField, FormFieldBaseProps, useFormField } from "@/Form/FormField";
import { FormContext } from "@/Form/index";
import { Select } from "@/Select";

export type BaseFormSelectProps = ComponentProps<typeof Select> &
    FormFieldBaseProps;

export interface FormSelectProps extends BaseFormSelectProps {
    placeholder?: string;
}

export const FormSelect = Object.assign(
    ({ placeholder, ...props }: FormSelectProps) => {
        "use client";

        const { form } = useContext(FormContext);

        const {
            fieldProps,
            controlProps: { name, disabled, ...controlProps },
        } = useFormField(props);

        return (
            <FormField {...fieldProps}>
                <Controller
                    render={({ field: { ref, value, onChange, ...field } }) => (
                        <Select
                            {...controlProps}
                            {...field}
                            ref={ref}
                            name={name}
                            value={value}
                            onValueChange={(value) => onChange(value)}
                        >
                            <Select.Button>
                                {placeholder ?? `Select ${props.name}`}
                            </Select.Button>
                            <Select.Panel>{props.children}</Select.Panel>
                        </Select>
                    )}
                    name={name}
                    disabled={disabled}
                    control={form.control}
                />
            </FormField>
        );
    },
    {
        Item: Select.Item,
    },
);
