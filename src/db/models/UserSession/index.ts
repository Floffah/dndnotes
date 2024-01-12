import { User } from "@/db/models/User";
import { IBaseModel } from "@/db/models/baseModel";

export interface UserSession extends IBaseModel {
    user: User;
    token: string;
    expiresAt: Date;
}
