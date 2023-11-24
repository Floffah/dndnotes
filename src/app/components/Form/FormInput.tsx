import { ComponentProps, useContext } from "react";

import { FormField } from "@/app/components/Form/FormField";
import { FormContext } from "@/app/components/Form/index";
import { Input } from "@/app/components/Input";

interface FormInputProps extends ComponentProps<typeof Input> {
    name: string;
    label: string;
    description?: string;
}

export function FormInput({
    name,
    label,
    description,
    disabled,
    ...props
}: FormInputProps) {
    const { form } = useContext(FormContext);

    const error = form.formState.errors[name];

    return (
        <FormField name={name} label={label} description={description}>
            <Input
                {...props}
                {...form.register(name)}
                disabled={form.formState?.isSubmitting || disabled}
                error={!!error}
            />
        </FormField>
    );
}
