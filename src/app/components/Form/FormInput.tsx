"use client";

import { ComponentProps, useContext } from "react";

import {
    FormField,
    FormFieldBaseProps,
    useFormField,
} from "@/app/components/Form/FormField";
import { FormContext } from "@/app/components/Form/index";
import { Input } from "@/app/components/Input";

interface FormInputProps
    extends Omit<
        ComponentProps<typeof Input> & FormFieldBaseProps,
        "children"
    > {}

export function FormInput({ ...props }: FormInputProps) {
    const { form } = useContext(FormContext);

    const {
        fieldProps,
        controlProps: { name, ...controlProps },
    } = useFormField(props);

    return (
        <FormField {...fieldProps}>
            <Input {...controlProps} {...form.register(name)} name={name} />
        </FormField>
    );
}
