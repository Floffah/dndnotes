import { RepeatInterval } from "@/db/enums/RepeatInterval";
import { User } from "@/db/models/User";
import { IBaseModel } from "@/db/models/baseModel";

export interface Campaign extends IBaseModel {
    name: string;
    createdBy: User;
    schedule: {
        manual: boolean;
        start: Date;
        repeat: RepeatInterval;
        dayOfWeek: number[]; // 0-6

        nextSession: Date; // virtual
    };

    totalSessionsHeld: number;
    sessionsHeldSinceScheduleStart: number;
}
