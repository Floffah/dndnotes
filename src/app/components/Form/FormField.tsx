"use client";

import clsx from "clsx";
import { ComponentProps, PropsWithChildren, useContext, useMemo } from "react";

import { FormContext } from "@/app/components/Form/index";

export interface FormFieldBaseProps {
    name: string;
    label?: string;
    description?: string;
    disabled?: boolean;
    orientation?: "horizontal" | "vertical";
    position?: "start" | "end";
    fieldClassName?: string;
}

export const useFormField = <Props extends FormFieldBaseProps>(
    props: Props,
    opts: {
        defaultOrientation?: FormFieldBaseProps["orientation"];
        defaultPosition?: FormFieldBaseProps["position"];
    } = {},
) => {
    const { form } = useContext(FormContext);

    const {
        name,
        label,
        description,
        orientation = opts.defaultOrientation,
        position = opts.defaultPosition,
        fieldClassName,
        disabled: propsDisabled,
        ...rest
    } = props;

    const disabled = form?.formState?.isSubmitting || propsDisabled;

    const error = form.formState.errors[name];

    return {
        error,
        fieldProps: {
            name,
            label,
            description,
            orientation,
            position,
            fieldClassName,
            disabled,
        },
        controlProps: {
            ...rest,
            name,
            disabled,
            error,
        },
    };
};

export interface FormFieldProps
    extends Omit<
        ComponentProps<"div"> & FormFieldBaseProps,
        "ref" | "children"
    > {}

export function FormField({
    label,
    name,
    description,
    orientation = "vertical",
    position = "start",
    className,
    fieldClassName,
    children,
    ...props
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
            label && (
                <label
                    className={clsx("font-semibold text-white/80", {
                        "!text-red-500": errorMessage,
                    })}
                >
                    {label}
                </label>
            )
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
                <p className="-mt-2 text-sm text-red-500">{errorMessage}</p>
            )
        );
    };

    return (
        <div
            className={clsx(className, fieldClassName, "flex flex-col gap-1")}
            {...props}
        >
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
                        {position === "start" && children}

                        <div
                            className={clsx("flex flex-col", {
                                "flex-1": position === "end",
                            })}
                        >
                            {renderLabel()}
                            {renderDescription()}
                        </div>

                        {position === "end" && children}
                    </div>

                    {renderErrorMessage()}
                </div>
            )}
        </div>
    );
}
