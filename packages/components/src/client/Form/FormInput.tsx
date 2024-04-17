"use client";

import { ComponentProps, useContext } from "react";

import {
    FormField,
    FormFieldBaseProps,
    useFormField,
} from "@/client/Form/FormField";
import { FormContext } from "@/client/Form/index";
import { Input } from "@/client/Input";

export interface FormInputProps
    extends Omit<
        ComponentProps<typeof Input> & FormFieldBaseProps,
        "children"
    > {}

export function FormInput({ ...props }: FormInputProps) {
    "use client";

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
