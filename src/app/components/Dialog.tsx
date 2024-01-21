"use client";

import * as RUIDialog from "@radix-ui/react-dialog";
import { Icon } from "@iconify/react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { animated, useTransition } from "@react-spring/web";
import clsx from "clsx";
import {
    ComponentProps,
    Fragment,
    MouseEvent,
    PropsWithChildren,
    ReactNode,
    createContext,
    forwardRef,
    startTransition,
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
            children: ReactNode | ((ctx: DialogContextValue) => ReactNode);
        } & Omit<ComponentProps<"div">, "children" | "ref">
    >(({ children, className, style, ...props }, ref) => {
        const ctx = useContext(DialogContext);

        const transition = useTransition(ctx.isOpen, {
            from: {
                opacity: 0,
                scale: 0.5,
                y: -20,
            },
            enter: {
                opacity: 1,
                scale: 1,
                y: 0,
            },
            leave: {
                opacity: 0,
                scale: 0.5,
                y: -20,
            },
            config: {
                tension: 500,
                friction: 30,
            },
        });

        const Container = ctx.portal ? RUIDialog.Portal : Fragment;

        return transition(
            (transitionStyle, isOpen) =>
                isOpen && (
                    <Container forceMount>
                        <RUIDialog.Overlay asChild forceMount>
                            <animated.div
                                className="fixed inset-0 bg-black/20"
                                style={{
                                    opacity: transitionStyle.opacity,
                                }}
                            />
                        </RUIDialog.Overlay>

                        <div className="pointer-events-none fixed inset-0 flex max-h-screen items-center justify-center overflow-y-auto py-2">
                            <RUIDialog.Content asChild forceMount>
                                <animated.div
                                    ref={ref}
                                    className={clsx(
                                        className,
                                        "pointer-events-auto relative flex h-fit max-h-full w-full flex-col gap-2 rounded-md bg-gray-800 p-4 shadow-lg",
                                    )}
                                    {...props}
                                    style={{
                                        ...style,
                                        ...transitionStyle,
                                    }}
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

                                    {typeof children === "function"
                                        ? children(ctx)
                                        : children}
                                </animated.div>
                            </RUIDialog.Content>
                        </div>
                    </Container>
                ),
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
    portal?: boolean;
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
            portal?: boolean;
            onOpenChange?: (open: boolean) => void;
        }>
    >(
        (
            {
                children,
                open: propsOpen,
                closable = true,
                portal = true,
                onOpenChange,
            },
            ref,
        ) => {
            const [open, setOpen] = useState(propsOpen ?? false);

            useEffect(() => {
                startTransition(() => setOpen(propsOpen ?? false));
            }, [propsOpen]);

            useImperativeHandle(ref, () => ({
                open: () => startTransition(() => setOpen(true)),
                close: () => startTransition(() => setOpen(false)),
            }));

            return (
                <RUIDialog.Root
                    open={open}
                    onOpenChange={(open) => {
                        onOpenChange?.(open);

                        (open || closable) &&
                            startTransition(() => setOpen(open));
                    }}
                    defaultOpen={propsOpen === true}
                    modal={true}
                >
                    <DialogContext.Provider
                        value={{
                            isOpen: open,
                            closable,
                            portal,
                            open: () => setOpen(true),
                            close: () => setOpen(false),
                        }}
                    >
                        {children}
                    </DialogContext.Provider>
                </RUIDialog.Root>
            );
        },
    ),
    {
        Trigger: RUIDialog.Trigger,
        Content: DialogContent,
    },
);
