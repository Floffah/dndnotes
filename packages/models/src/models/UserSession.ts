import { UserSessionType } from "@/enums/UserSessionType";
import { User } from "@/models/User";
import { IBaseModel } from "@/types/baseModel";

export interface UserSession extends IBaseModel {
    user: User;
    token: string;
    expiresAt: Date;
    type: UserSessionType;
}
