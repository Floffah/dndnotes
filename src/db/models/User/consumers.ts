import type { User } from "@/db/models/User/index";
import { BaseAPIModel } from "@/db/types/baseModel";
import { ConsumerContext } from "@/db/types/consumerContext";

export class UserAPIModel extends BaseAPIModel implements User {
    email: string;
    name: string;
    providers: User["providers"];

    constructor(user: User, ctx: ConsumerContext) {
        super(user, ctx);
        this.name = user.name;
        this.email = ctx.user && user.id === ctx.user.id ? user.email : null!;
        this.providers = null!;
    }
}
