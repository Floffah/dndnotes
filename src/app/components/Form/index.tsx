"use client";

import {
    ComponentProps,
    PropsWithChildren,
    createContext,
    forwardRef,
    useContext,
} from "react";
import {
    FormProvider as RHFProvider,
    SubmitErrorHandler,
    SubmitHandler,
    UseFormReturn,
    useForm,
} from "react-hook-form";

import { FormButton } from "@/app/components/Form/FormButton";
import { FormDateInput } from "@/app/components/Form/FormDateInput";
import { FormField } from "@/app/components/Form/FormField";
import { FormInput } from "@/app/components/Form/FormInput";
import { FormSelect } from "@/app/components/Form/FormSelect";
import { FormSwitch } from "@/app/components/Form/FormSwitch";

interface FormProps {
    form: UseFormReturn<any, any, any>;
    onSubmit: SubmitHandler<any>;
    onSubmitError?: SubmitErrorHandler<any>;
}

interface FormContextValue extends FormProps {}

export const FormContext = createContext<FormContextValue>(null!);

const FormProvider = ({
    children,
    ...value
}: PropsWithChildren<FormContextValue>) => {
    return (
        <FormContext.Provider value={value}>
            <RHFProvider {...value.form}>{children}</RHFProvider>
        </FormContext.Provider>
    );
};

const FormRoot = forwardRef<HTMLFormElement, ComponentProps<"form">>(
    ({ children, ...props }, ref) => {
        const form = useContext(FormContext);

        return (
            <form
                {...props}
                ref={ref}
                onSubmit={form.form.handleSubmit(
                    form.onSubmit,
                    form.onSubmitError,
                )}
            >
                {children}
            </form>
        );
    },
);

export const Form = Object.assign(
    forwardRef<
        HTMLFormElement,
        Omit<ComponentProps<"form">, "onSubmit"> & FormProps
    >(({ form, onSubmit, onSubmitError, children, ...props }, ref) => {
        return (
            <FormProvider
                form={form}
                onSubmit={onSubmit}
                onSubmitError={onSubmitError}
            >
                <FormRoot ref={ref}>{children}</FormRoot>
            </FormProvider>
        );
    }),
    {
        Provider: FormProvider,
        Root: FormRoot,
        Button: FormButton,
        DateInput: FormDateInput,
        Field: FormField,
        Input: FormInput,
        Select: FormSelect,
        Switch: FormSwitch,
    },
);
