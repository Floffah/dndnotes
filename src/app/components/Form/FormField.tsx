import clsx from "clsx";
import { PropsWithChildren, useContext, useMemo } from "react";

import { FormContext } from "@/app/components/Form/index";

export interface FormFieldProps {
    name: string;
    label: string;
    description?: string;
}

export function FormField({
    label,
    name,
    description,
    children,
}: PropsWithChildren<FormFieldProps>) {
    const { form } = useContext(FormContext);

    const error = form.formState.errors[name];
    const errorMessage = useMemo(() => {
        if (!error) {
            return null;
        }

        if (error.message) {
            return error.message as string;
        } else {
            return error.type as string;
        }
    }, [error]);

    return (
        <div className="flex flex-col space-y-1">
            <label
                className={clsx("font-semibold text-white/80", {
                    "!text-red-500": errorMessage,
                })}
            >
                {label}
            </label>
            {description && (
                <p className="text-sm text-white/70">{description}</p>
            )}

            {children}

            {errorMessage && (
                <p className="text-sm text-red-500">{errorMessage}</p>
            )}
        </div>
    );
}
