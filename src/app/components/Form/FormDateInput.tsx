"use client";

import { ComponentProps, useContext } from "react";
import { useController } from "react-hook-form";

import { DateInput } from "@/app/components/DateInput";
import {
    FormField,
    FormFieldBaseProps,
    useFormField,
} from "@/app/components/Form/FormField";
import { FormContext } from "@/app/components/Form/index";

interface FormDateInputProps
    extends Omit<
        ComponentProps<typeof DateInput> & FormFieldBaseProps,
        "value"
    > {}

export function FormDateInput(props: FormDateInputProps) {
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
