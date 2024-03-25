import type { ObjectId } from "mongoose";

import { ConsumerContext } from "@/types/consumerContext";

export interface IBaseModel {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export class BaseAPIModel implements IBaseModel {
    id: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(
        baseModel: IBaseModel | (IBaseModel & { id?: string; _id: ObjectId }),
        ctx: ConsumerContext,
    ) {
        this.id = "_id" in baseModel ? baseModel._id.toString() : baseModel.id;
        this.createdAt = baseModel.createdAt;
        this.updatedAt = baseModel.updatedAt;
    }
}
