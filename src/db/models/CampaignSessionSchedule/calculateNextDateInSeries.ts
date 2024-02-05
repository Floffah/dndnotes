import { addDays, addMonths } from "date-fns";

import { RepeatInterval } from "@/db/enums/RepeatInterval";

export function calculateNextDateInSeries(
    interval: RepeatInterval,
    firstDate: Date,
    length: number,
) {
    let intervalsSinceStart = 0; // not representative of actual the number of sessions, just the number of intervals

    switch (interval) {
        case RepeatInterval.WEEKLY:
            intervalsSinceStart =
                Math.floor(
                    (Date.now() - firstDate.getTime()) /
                        (7 * 24 * 60 * 60 * 1000),
                ) ?? 0;
            break;
        case RepeatInterval.FORTNIGHTLY:
            intervalsSinceStart =
                Math.floor(
                    (Date.now() - firstDate.getTime()) /
                        (14 * 24 * 60 * 60 * 1000),
                ) ?? 0;
            break;
        case RepeatInterval.MONTHLY:
            intervalsSinceStart =
                Math.floor(
                    (Date.now() - firstDate.getTime()) /
                        (30 * 24 * 60 * 60 * 1000),
                ) ?? 0;
            break;
    }

    let nextDate = new Date(firstDate);

    switch (interval) {
        case RepeatInterval.WEEKLY:
            nextDate = addDays(nextDate, intervalsSinceStart * 7);
            break;
        case RepeatInterval.FORTNIGHTLY:
            nextDate = addDays(nextDate, intervalsSinceStart * 14);
            break;
        case RepeatInterval.MONTHLY:
            nextDate = addMonths(nextDate, intervalsSinceStart);
            break;
    }

    // 'current session' state - if there is a session scheduled within the previous length period, return that
    if (
        length &&
        Date.now() > nextDate.getTime() &&
        Date.now() - nextDate.getTime() < length
    ) {
        return nextDate;
    }

    // but otherwise return the next session
    switch (interval) {
        case RepeatInterval.WEEKLY:
            nextDate = addDays(nextDate, 7);
            break;
        case RepeatInterval.FORTNIGHTLY:
            nextDate = addDays(nextDate, 14);
            break;
        case RepeatInterval.MONTHLY:
            nextDate = addMonths(nextDate, 1);
            break;
    }

    return nextDate;
}
