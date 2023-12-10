import { ComponentProps, useContext } from "react";
import { useController } from "react-hook-form";

import { DateInput } from "@/app/components/DateInput";
import { FormField } from "@/app/components/Form/FormField";
import { FormContext } from "@/app/components/Form/index";

interface FormDateInputProps
    extends Omit<ComponentProps<typeof DateInput>, "value"> {
    name: string;
    label: string;
    description?: string;
}

export function FormDateInput({
    name,
    label,
    description,
    disabled,
    ...props
}: FormDateInputProps) {
    const { form } = useContext(FormContext);

    const error = form.formState.errors[name];

    const { field } = useController({
        name,
        control: form.control,
        defaultValue: form.formState.defaultValues?.[name],
    });

    return (
        <FormField name={name} label={label} description={description}>
            <DateInput
                {...props}
                ref={field.ref}
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                name={name}
                disabled={form.formState?.isSubmitting || disabled}
                error={!!error}
            />
        </FormField>
    );
}
