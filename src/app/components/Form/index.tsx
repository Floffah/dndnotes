import { ComponentProps, createContext, forwardRef } from "react";
import {
    FormProvider,
    SubmitHandler,
    UseFormReturn,
    useForm,
} from "react-hook-form";

import { FormButton } from "@/app/components/Form/FormButton";
import { FormDateInput } from "@/app/components/Form/FormDateInput";
import { FormField } from "@/app/components/Form/FormField";
import { FormInput } from "@/app/components/Form/FormInput";
import { FormSwitch } from "@/app/components/Form/FormSwitch";

interface FormProps extends ComponentProps<"form"> {
    form: UseFormReturn<any, any, any>;
    onSubmit: SubmitHandler<any>;
}

interface FormContextValue {
    form: ReturnType<typeof useForm>;
}

export const FormContext = createContext<FormContextValue>(null!);

export const Form = Object.assign(
    forwardRef<HTMLFormElement, FormProps>(
        ({ form, onSubmit, children, ...props }, ref) => {
            return (
                <FormContext.Provider value={{ form }}>
                    <FormProvider {...form}>
                        <form
                            {...props}
                            ref={ref}
                            onSubmit={form.handleSubmit(onSubmit)}
                        >
                            {children}
                        </form>
                    </FormProvider>
                </FormContext.Provider>
            );
        },
    ),
    {
        Button: FormButton,
        Field: FormField,
        Input: FormInput,
        Switch: FormSwitch,
        DateInput: FormDateInput,
    },
);
