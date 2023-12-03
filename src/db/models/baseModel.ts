import type { ObjectId } from "mongoose";

import { ToObjectType } from "@/db/models/types";

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
    ) {
        this.id = "_id" in baseModel ? baseModel._id.toString() : baseModel.id;
        this.createdAt = baseModel.createdAt;
        this.updatedAt = baseModel.updatedAt;
    }

    toObject(opts?: any) {
        return {
            id: this.id,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        };
    }
}
export type BaseAPIType = ToObjectType<BaseAPIModel>;

export class BaseClientModel implements IBaseModel {
    id: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(
        baseModel: Omit<IBaseModel, "createdAt" | "updatedAt"> & {
            createdAt: string;
            updatedAt: string;
        },
    ) {
        this.id = baseModel.id;
        this.createdAt = new Date(baseModel.createdAt);
        this.updatedAt = new Date(baseModel.updatedAt);
    }

    toObject(opts?: any) {
        return {
            id: this.id,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
export type BaseClientType = ToObjectType<BaseClientModel>;
