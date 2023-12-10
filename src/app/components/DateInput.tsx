import * as Popover from "@radix-ui/react-popover";
import clsx from "clsx";
import {
    ComponentProps,
    PropsWithChildren,
    forwardRef,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { Divider } from "@/app/components/Divider";
import { Icon } from "@/app/components/Icon";
import { Input } from "@/app/components/Input";
import { Select } from "@/app/components/Select";

interface DateInputProps
    extends Omit<ComponentProps<typeof Input>, "value" | "children" | "ref"> {
    value?: Date;
    minimumDate?: Date;
    maximumDate?: Date;
    onValueChange?: (value: Date) => void;
}

const MonthButton = ({
    children,
    selected,
    ...props
}: Omit<ComponentProps<"button">, "ref"> & { selected: boolean }) => {
    const ref = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        ref.current?.scrollIntoView({
            behavior: "instant",
            block: "center",
        });
    }, []);

    return (
        <button
            {...props}
            ref={ref}
            className={clsx("", {
                "border-b-2 border-blue-600": selected,
            })}
        >
            {children}
        </button>
    );
};

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
    (
        {
            className,
            value: propsValue,
            onValueChange,
            minimumDate = new Date(0),
            maximumDate = new Date("3000-12-31T23:59:59.999Z"),
            ...props
        },
        ref,
    ) => {
        const monthBoxRef = useRef<HTMLDivElement>(null);

        const scrollRightIntervalRef = useRef<number>();
        const scrollLeftIntervalRef = useRef<number>();

        const [_value, setValue] = useState(propsValue);
        const value = _value ?? new Date();

        const [hoursError, setHoursError] = useState(false);
        const [minutesError, setMinutesError] = useState(false);

        const firstDayOfMonth = new Date(
            value.getFullYear(),
            value.getMonth(),
            1,
        );
        const paddingDays = firstDayOfMonth.getDay();

        useEffect(() => {
            setValue(propsValue);
        }, [propsValue]);

        return (
            <Popover.Root
                onOpenChange={(open) => {
                    if (!open) {
                        setValue(value);
                        onValueChange?.(value);
                        props.onBlur?.({} as any);
                    }
                }}
            >
                <Popover.Trigger asChild>
                    <Input
                        ref={ref}
                        value={
                            typeof Intl !== "undefined" && _value
                                ? Intl.DateTimeFormat("en-GB", {
                                      year: "numeric",
                                      month: "numeric",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "numeric",
                                  }).format(_value)
                                : undefined
                        }
                        placeholder="DD/MM/YYYY HH:MM"
                        {...props}
                    />
                </Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content className="rounded-lg bg-gray-700 shadow-xl">
                        <Popover.Arrow className="fill-gray-700" />

                        <div className="relative flex w-full flex-col">
                            <button
                                className="right-2.25 top-2.25 fixed items-center rounded bg-white/10 px-1 py-0.5 text-xs"
                                onClick={() => {
                                    setValue(new Date());
                                }}
                            >
                                TODAY
                            </button>

                            <div className="flex items-center justify-center gap-2 pb-0.5 pt-1.5">
                                <button
                                    className="flex h-5 w-5 items-center justify-center rounded bg-white/10"
                                    onClick={() => {
                                        const newValue = new Date(value);

                                        if (
                                            newValue.getFullYear() ===
                                            minimumDate.getFullYear()
                                        ) {
                                            return;
                                        }

                                        newValue.setFullYear(
                                            newValue.getFullYear() - 1,
                                        );

                                        setValue(newValue);
                                    }}
                                >
                                    <Icon
                                        label="subtract year icon"
                                        icon="mdi:minus"
                                    />
                                </button>
                                <p>{value.getFullYear()}</p>
                                <button
                                    className="flex h-5 w-5 items-center justify-center rounded bg-white/10"
                                    onClick={() => {
                                        const newValue = new Date(value);

                                        if (
                                            newValue.getFullYear() ===
                                            maximumDate.getFullYear()
                                        ) {
                                            return;
                                        }

                                        newValue.setFullYear(
                                            newValue.getFullYear() + 1,
                                        );

                                        setValue(newValue);
                                    }}
                                >
                                    <Icon
                                        label="add year icon"
                                        icon="mdi:plus"
                                    />
                                </button>
                            </div>

                            <div className="no-scrollbar flex max-w-[18rem] items-center gap-2 overflow-x-auto py-1">
                                <button
                                    className="flex items-center justify-center"
                                    onMouseDown={() => {
                                        scrollLeftIntervalRef.current =
                                            window.setInterval(() => {
                                                monthBoxRef.current?.scrollBy({
                                                    left: -10,
                                                    behavior: "smooth",
                                                });
                                            }, 50);
                                    }}
                                    onMouseUp={() => {
                                        window.clearInterval(
                                            scrollLeftIntervalRef.current,
                                        );
                                    }}
                                >
                                    <Icon
                                        label="scroll left icon"
                                        icon="mdi:chevron-left"
                                        className="h-5 w-5"
                                    />
                                </button>
                                <div
                                    className="no-scrollbar flex items-center gap-2 overflow-x-auto"
                                    ref={monthBoxRef}
                                >
                                    {[
                                        "Jan",
                                        "Feb",
                                        "Mar",
                                        "Apr",
                                        "May",
                                        "Jun",
                                        "Jul",
                                        "Aug",
                                        "Sep",
                                        "Oct",
                                        "Nov",
                                        "Dec",
                                    ].map((month, index) => (
                                        <MonthButton
                                            key={index}
                                            selected={
                                                index === value.getMonth()
                                            }
                                            onClick={() => {
                                                const newValue = new Date(
                                                    value,
                                                );

                                                newValue.setMonth(index);

                                                setValue(newValue);
                                            }}
                                        >
                                            {month}
                                        </MonthButton>
                                    ))}
                                </div>
                                <button
                                    className="flex items-center justify-center"
                                    onMouseDown={() => {
                                        scrollRightIntervalRef.current =
                                            window.setInterval(() => {
                                                monthBoxRef.current?.scrollBy({
                                                    left: 10,
                                                    behavior: "smooth",
                                                });
                                            }, 50);
                                    }}
                                    onMouseUp={() => {
                                        window.clearInterval(
                                            scrollRightIntervalRef.current,
                                        );
                                    }}
                                >
                                    <Icon
                                        label="scroll right icon"
                                        icon="mdi:chevron-right"
                                        className="h-5 w-5"
                                    />
                                </button>
                            </div>

                            <div className="mt-2 grid w-full grid-cols-7">
                                {["S", "M", "T", "W", "T", "F", "S"].map(
                                    (day, index) => (
                                        <p
                                            key={index}
                                            className="text-center text-sm font-bold text-blue-300"
                                        >
                                            {day}
                                        </p>
                                    ),
                                )}
                                {Array.from(
                                    { length: 35 },
                                    (_, index) => index,
                                ).map((index) => {
                                    const dayIndex = index - paddingDays + 1;
                                    const date = new Date(
                                        value.getFullYear(),
                                        value.getMonth(),
                                        dayIndex,
                                    );

                                    return (
                                        <button
                                            key={index}
                                            className={clsx(
                                                "flex items-center justify-center rounded py-0.5 text-center",
                                                {
                                                    "cursor-default text-white/50":
                                                        date.getMonth() !==
                                                        value.getMonth(),
                                                    "text-blue-400":
                                                        date.getMonth() ===
                                                            value.getMonth() &&
                                                        date.getDate() ===
                                                            value.getDate(),
                                                },
                                            )}
                                            onClick={() => {
                                                if (
                                                    date.getMonth() !==
                                                    value.getMonth()
                                                ) {
                                                    return;
                                                }

                                                const newValue = new Date(
                                                    value,
                                                );

                                                newValue.setDate(
                                                    date.getDate(),
                                                );

                                                setValue(newValue);
                                            }}
                                        >
                                            {date.getDate()}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex w-full items-center justify-center gap-1 py-1.5">
                                <Input
                                    placeholder="HH"
                                    className="w-16"
                                    value={value.getHours().toString()}
                                    onChange={(event) => {
                                        const hours = parseInt(
                                            event.target.value,
                                        );

                                        if (
                                            isNaN(hours) ||
                                            hours < 0 ||
                                            hours > 23
                                        ) {
                                            setHoursError(true);
                                            return;
                                        }

                                        const newValue = new Date(value);

                                        newValue.setHours(
                                            parseInt(event.target.value),
                                            newValue.getMinutes(),
                                        );

                                        setValue(newValue);
                                    }}
                                    type="number"
                                />
                                <p className="text-2xl font-semibold text-white/50">
                                    :
                                </p>
                                <Input
                                    placeholder="MM"
                                    className="w-16"
                                    value={value.getMinutes().toString()}
                                    onChange={(event) => {
                                        const minutes = parseInt(
                                            event.target.value,
                                        );

                                        if (
                                            isNaN(minutes) ||
                                            minutes < 0 ||
                                            minutes > 59
                                        ) {
                                            setMinutesError(true);
                                            return;
                                        }

                                        const newValue = new Date(value);

                                        newValue.setMinutes(
                                            parseInt(event.target.value),
                                        );

                                        setValue(newValue);
                                    }}
                                    type="number"
                                />
                            </div>
                        </div>
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
        );
    },
);
