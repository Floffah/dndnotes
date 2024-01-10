import { ComponentProps, useContext } from "react";
import { Controller } from "react-hook-form";

import { FormField } from "@/app/components/Form/FormField";
import { FormContext } from "@/app/components/Form/index";
import { Select } from "@/app/components/Select";

interface FormSelectProps extends ComponentProps<typeof Select> {
    name: string;
    label: string;
    placeholder?: string;
    description?: string;
}

export const FormSelect = Object.assign(
    ({ name, label, description, placeholder, ...props }: FormSelectProps) => {
        const { form } = useContext(FormContext);

        return (
            <FormField name={name} label={label} description={description}>
                <Controller
                    render={({ field: { ref, value, onChange, ...field } }) => (
                        <Select
                            {...props}
                            {...field}
                            ref={ref}
                            value={value}
                            onValueChange={(value) => onChange(value)}
                        >
                            <Select.Button>
                                {placeholder ?? `Select ${label.toLowerCase()}`}
                            </Select.Button>
                            <Select.Panel>{props.children}</Select.Panel>
                        </Select>
                    )}
                    name={name}
                    control={form.control}
                />
            </FormField>
        );
    },
    {
        Item: Select.Item,
    },
);
