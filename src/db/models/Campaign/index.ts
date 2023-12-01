import { User } from "@/db/models/User";
import { IBaseModel } from "@/db/models/baseModel";

export interface Campaign extends IBaseModel {
    name: string;
    createdBy: User;
}
