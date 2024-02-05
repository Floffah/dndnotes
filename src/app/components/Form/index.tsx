"use client";

import {
    BaseSyntheticEvent,
    ComponentProps,
    PropsWithChildren,
    createContext,
    forwardRef,
    useCallback,
    useContext,
} from "react";
import {
    FormProvider as RHFProvider,
    SubmitErrorHandler,
    SubmitHandler,
    UseFormReturn,
} from "react-hook-form";

import { FormButton } from "@/app/components/Form/FormButton";
import { FormDateInput } from "@/app/components/Form/FormDateInput";
import { FormField } from "@/app/components/Form/FormField";
import { FormInput } from "@/app/components/Form/FormInput";
import { FormSelect } from "@/app/components/Form/FormSelect";
import { FormSwitch } from "@/app/components/Form/FormSwitch";

interface FormProps {
    form: UseFormReturn<any, any, any>;
    submitHandler: SubmitHandler<any>;
    submitErrorHandler?: SubmitErrorHandler<any>;
}

interface FormContextValue extends FormProps {
    submit: (e?: BaseSyntheticEvent) => Promise<void>;
}

export const FormContext = createContext<FormContextValue>(null!);

const FormProvider = ({ children, ...value }: PropsWithChildren<FormProps>) => {
    const submit = useCallback(
        (e?: BaseSyntheticEvent) =>
            value.form.handleSubmit(
                value.submitHandler,
                value.submitErrorHandler,
            )(e),
        [value.form, value.submitErrorHandler, value.submitHandler],
    );

    return (
        <FormContext.Provider
            value={{
                ...value,
                submit,
            }}
        >
            <RHFProvider {...value.form}>{children}</RHFProvider>
        </FormContext.Provider>
    );
};

const FormRoot = forwardRef<HTMLFormElement, ComponentProps<"form">>(
    ({ children, ...props }, ref) => {
        const form = useContext(FormContext);

        return (
            <form {...props} ref={ref} onSubmit={form.submit}>
                {children}
            </form>
        );
    },
);

export const Form = Object.assign(
    forwardRef<
        HTMLFormElement,
        Omit<ComponentProps<"form">, "onSubmit" | "ref"> & FormProps
    >(
        (
            { form, submitHandler, submitErrorHandler, children, ...props },
            ref,
        ) => {
            return (
                <FormProvider
                    form={form}
                    submitHandler={submitHandler}
                    submitErrorHandler={submitErrorHandler}
                >
                    <FormRoot ref={ref} {...props}>
                        {children}
                    </FormRoot>
                </FormProvider>
            );
        },
    ),
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
