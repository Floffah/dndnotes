import clsx from "clsx";
import { PropsWithChildren, useContext, useMemo } from "react";

import { FormContext } from "@/app/components/Form/index";

export interface FormFieldProps {
    name: string;
    label: string;
    description?: string;
    orientation?: "horizontal" | "vertical";
}

export function FormField({
    label,
    name,
    description,
    orientation = "vertical",
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

    const renderLabel = () => {
        return (
            <label
                className={clsx("font-semibold text-white/80", {
                    "!text-red-500": errorMessage,
                })}
            >
                {label}
            </label>
        );
    };

    const renderDescription = () => {
        return (
            description && (
                <p className="text-sm text-white/70">{description}</p>
            )
        );
    };

    const renderErrorMessage = () => {
        return (
            errorMessage && (
                <p className="text-sm text-red-500">{errorMessage}</p>
            )
        );
    };

    return (
        <div className="flex flex-col space-y-1">
            {orientation === "vertical" && (
                <>
                    {renderLabel()}
                    {renderDescription()}

                    {children}

                    {renderErrorMessage()}
                </>
            )}

            {orientation === "horizontal" && (
                <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                        {children}
                        <div className="flex flex-col">
                            {renderLabel()}
                            {renderDescription()}
                        </div>
                    </div>

                    {renderErrorMessage()}
                </div>
            )}
        </div>
    );
}
