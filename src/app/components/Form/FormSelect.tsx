import { ComponentProps, useContext } from "react";
import { Controller } from "react-hook-form";

import {
    FormField,
    FormFieldBaseProps,
    useFormField,
} from "@/app/components/Form/FormField";
import { FormContext } from "@/app/components/Form/index";
import { Select } from "@/app/components/Select";

type Base = ComponentProps<typeof Select> & FormFieldBaseProps;
interface FormSelectProps extends Base {
    placeholder?: string;
}

export const FormSelect = Object.assign(
    ({ placeholder, ...props }: FormSelectProps) => {
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
