import { User } from "@/db/models/User";
import { IBaseModel } from "@/db/models/baseModel";

export interface Session extends IBaseModel {
    user: User;
    token: string;
    expiresAt: Date;
}
