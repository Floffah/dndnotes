"use client";

import { ComponentProps, useContext } from "react";
import { useController } from "react-hook-form";

import { DateInput } from "@/client/DateInput";
import {
    FormField,
    FormFieldBaseProps,
    useFormField,
} from "@/client/Form/FormField";
import { FormContext } from "@/client/Form/index";

export interface FormDateInputProps
    extends Omit<
        ComponentProps<typeof DateInput> & FormFieldBaseProps,
        "value"
    > {}

export function FormDateInput(props: FormDateInputProps) {
    "use client";

    const { form } = useContext(FormContext);

    const {
        fieldProps,
        controlProps: { name, disabled, ...controlProps },
    } = useFormField(props);

    const { field } = useController({
        name,
        control: form.control,
        defaultValue: form.formState.defaultValues?.[name],
    });

    return (
        <FormField {...fieldProps}>
            <DateInput
                {...controlProps}
                ref={field.ref}
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                name={name}
            />
        </FormField>
    );
}
