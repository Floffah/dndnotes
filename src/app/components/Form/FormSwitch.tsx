import { ComponentProps, useContext } from "react";

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

    const error = form.formState.errors[name];

    return (
        <FormField
            name={name}
            label={label}
            description={description}
            orientation="horizontal"
        >
            <Switch
                {...props}
                {...form.register(name)}
                disabled={form.formState?.isSubmitting || disabled}
            />
        </FormField>
    );
}
