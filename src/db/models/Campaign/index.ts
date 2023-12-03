import { User } from "@/db/models/User";
import { IBaseModel } from "@/db/models/baseModel";

export interface Campaign extends IBaseModel {
    name: string;
    createdBy: User;
    schedule: {
        manual: boolean;
        start: Date;
        repeat: number; // in days
        dayOfWeek: number[]; // 0-6

        nextSession: Date; // virtual
    };
}
