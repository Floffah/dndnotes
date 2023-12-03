import { Campaign } from "./Campaign";
import { User } from "./User";

import { BaseAPIModel, BaseClientModel } from "@/db/models/baseModel";

export type ToObjectType<T extends BaseAPIModel | BaseClientModel> = ReturnType<
    T["toObject"]
>;

export type OmitAPI<
    Object,
    Fields extends keyof Omit<Object, "toObject" | "createdAt" | "updatedAt">,
> = Omit<RemoveAPIFields<Object>, Fields>;

export type RemoveAPIFields<Object> = Omit<
    Object,
    "toObject" | "createdAt" | "updatedAt"
>;

export type ModelLike<T> = PartialAndNullable<Dateify<T>>;

export type PartialAndNullable<T> = {
    [P in keyof T]?: T[P] | null;
};

// type that removes any date
type Dateify<T> = {
    [P in keyof T]: T[P] extends Date ? Date | string : T[P];
};
