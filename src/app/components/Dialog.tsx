"use client";

import * as RUIDialog from "@radix-ui/react-dialog";
import { Icon } from "@iconify/react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import clsx from "clsx";
import {
    ComponentProps,
    MouseEvent,
    PropsWithChildren,
    ReactNode,
    createContext,
    forwardRef,
    useContext,
    useEffect,
    useImperativeHandle,
    useState,
} from "react";

import { Button } from "@/app/components/Button";

const DialogContentTitle = forwardRef<
    HTMLHeadingElement,
    PropsWithChildren<
        { visuallyHidden?: boolean; asChild?: boolean } & Omit<
            ComponentProps<"h1">,
            "children" | "ref"
        >
    >
>(({ children, visuallyHidden, className, ...props }, ref) => {
    const title = (
        <RUIDialog.Title
            ref={ref}
            className={clsx(className, "text-center text-2xl font-bold")}
            {...props}
        >
            {children}
        </RUIDialog.Title>
    );

    if (visuallyHidden) {
        return <VisuallyHidden asChild>{title}</VisuallyHidden>;
    }

    return title;
});

const DialogContentDescription = forwardRef<
    HTMLParagraphElement,
    PropsWithChildren<
        { visuallyHidden?: boolean; asChild?: boolean } & Omit<
            ComponentProps<"p">,
            "children" | "ref"
        >
    >
>(({ children, visuallyHidden, className, ...props }, ref) => {
    const description = (
        <RUIDialog.Description
            ref={ref}
            className={clsx(className, "text-center text-base text-white/80")}
            {...props}
        >
            {children}
        </RUIDialog.Description>
    );

    if (visuallyHidden) {
        return <VisuallyHidden asChild>{description}</VisuallyHidden>;
    }

    return description;
});

const DialogContentBody = forwardRef<
    HTMLDivElement,
    PropsWithChildren<Omit<ComponentProps<"div">, "children" | "ref">>
>(({ children, className, ...props }, ref) => {
    return (
        <div ref={ref} className={clsx(className, "flex-1")} {...props}>
            {children}
        </div>
    );
});

const DialogContentFooterButton = forwardRef<
    HTMLButtonElement,
    PropsWithChildren<
        {
            onClick?: (
                close: () => void,
                event: MouseEvent<HTMLButtonElement>,
            ) => void;
        } & Omit<ComponentProps<typeof Button>, "children" | "ref" | "onClick">
    >
>(({ children, className, onClick, ...props }, ref) => {
    const { close } = useContext(DialogContext);

    return (
        <Button
            ref={ref}
            className={clsx(className, "px-5")}
            onClick={(e) => {
                if (onClick) {
                    onClick(close, e);
                } else {
                    close();
                }
            }}
            {...props}
        >
            {children}
        </Button>
    );
});

const DialogContentFooter = Object.assign(
    forwardRef<
        HTMLDivElement,
        PropsWithChildren<Omit<ComponentProps<"div">, "children" | "ref">>
    >(({ children, className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={clsx(className, "flex justify-end gap-2")}
                {...props}
            >
                {children}
            </div>
        );
    }),
    {
        Button: DialogContentFooterButton,
    },
);
const DialogContent = Object.assign(
    forwardRef<
        HTMLDivElement,
        {
            children: ReactNode | ((ctx: { close: () => void }) => ReactNode);
        } & Omit<ComponentProps<"div">, "children" | "ref">
    >(({ children, className, ...props }, ref) => {
        const ctx = useContext(DialogContext);

        return (
            <RUIDialog.Portal>
                <RUIDialog.Overlay className="fixed inset-0 bg-black/20" />
                <RUIDialog.Content
                    ref={ref}
                    className={clsx(
                        className,
                        "absolute left-1/2 top-1/2 flex h-fit w-full -translate-x-1/2 -translate-y-1/2 flex-col gap-2 rounded-md bg-gray-800 p-4 shadow-lg",
                    )}
                    {...props}
                >
                    {ctx.closable && (
                        <RUIDialog.Close asChild>
                            <Icon
                                icon="mdi:close"
                                className="absolute right-0 top-0 m-2 cursor-pointer"
                                width="24"
                                height="24"
                            />
                        </RUIDialog.Close>
                    )}

                    {typeof children === "function" ? children(ctx) : children}
                </RUIDialog.Content>
            </RUIDialog.Portal>
        );
    }),
    {
        Title: DialogContentTitle,
        Description: DialogContentDescription,
        Body: DialogContentBody,
        Footer: DialogContentFooter,
    },
);

export interface DialogRef {
    open: () => void;
    close: () => void;
}

interface DialogContextValue {
    isOpen: boolean;
    closable: boolean;
    open: () => void;
    close: () => void;
}

const DialogContext = createContext<DialogContextValue>(null!);

export const Dialog = Object.assign(
    forwardRef<
        DialogRef,
        PropsWithChildren<{
            open?: boolean;
            modal?: boolean;
            closable?: boolean;
            onOpenChange?: (open: boolean) => void;
        }>
    >(({ children, open: propsOpen, closable = true, onOpenChange }, ref) => {
        const [open, setOpen] = useState(propsOpen ?? false);

        useEffect(() => {
            setOpen(propsOpen ?? false);
        }, [propsOpen]);

        useImperativeHandle(ref, () => ({
            open: () => setOpen(true),
            close: () => setOpen(false),
        }));

        return (
            <RUIDialog.Root
                open={open}
                onOpenChange={(open) => {
                    onOpenChange?.(open);

                    (closable || open) && setOpen(open);
                }}
                defaultOpen={propsOpen === true}
                modal={true}
            >
                <DialogContext.Provider
                    value={{
                        isOpen: open,
                        closable,
                        open: () => setOpen(true),
                        close: () => setOpen(false),
                    }}
                >
                    {children}
                </DialogContext.Provider>
            </RUIDialog.Root>
        );
    }),
    {
        Trigger: RUIDialog.Trigger,
        Content: DialogContent,
    },
);
