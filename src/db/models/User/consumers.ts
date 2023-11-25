import type { InferSchemaType } from "mongoose";

import type { User } from "@/db/models/User/index";
import type { UserSchema } from "@/db/models/User/model";
import { BaseAPIModel, BaseClientModel } from "@/db/models/baseModel";
import type { OmitAPI, ToObjectType } from "@/db/models/types";

export class UserAPIModel extends BaseAPIModel implements Omit<User, "email"> {
    email: string | null;
    name: string;
    providers: User["providers"];

    constructor(user: InferSchemaType<typeof UserSchema>) {
        super(user);
        this.name = user.name;
        this.email = user.email;
        this.providers = user.providers;
    }

    toObject(opts: { user: User }) {
        const base = super.toObject();

        let email: string | null = null;

        if (base.id === opts.user.id) {
            email = this.email;
        }

        return {
            ...base,
            name: this.name,
            email,
        };
    }
}

export type UserAPIType = ToObjectType<UserAPIModel>;

export class UserClientModel
    extends BaseClientModel
    implements OmitAPI<UserAPIModel, "email" | "providers">
{
    email: string | null;
    name: string;

    constructor(user: UserAPIType) {
        super(user);
        this.name = user.name;
        this.email = user.email;
    }

    toObject(opts: { user: User }) {
        return {
            ...super.toObject(),
            name: this.name,
            email: this.email,
        };
    }
}
