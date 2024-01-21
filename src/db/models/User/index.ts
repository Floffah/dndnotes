import { IBaseModel } from "@/db/types/baseModel";

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
