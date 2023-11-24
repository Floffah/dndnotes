import { BaseAPIModel, BaseClientModel } from "@/db/models/baseModel";

export type ToObjectType<T extends BaseAPIModel | BaseClientModel> = ReturnType<
    T["toObject"]
>;

export type OmitAPI<
    Object,
    Fields extends keyof Omit<Object, "toObject" | "createdAt" | "updatedAt">,
> = Omit<Object, "toObject" | "createdAt" | "updatedAt" | Fields>;
