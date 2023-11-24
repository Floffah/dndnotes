import { IBaseModel } from "@/db/models/baseModel";

export interface User extends IBaseModel {
    email: string;
    name: string;
    providers: {
        discord: {
            id: string;
            username: string;
        };
    };
}
