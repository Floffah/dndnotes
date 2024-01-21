import { Schema, model } from "mongoose";

export function createModel<S extends Schema>(name: string, schema: S) {
    schema.virtual("id").get(function (this: any) {
        return this._id.toHexString();
    });

    schema.set("timestamps", true);

    schema.set("toJSON", {
        virtuals: true,
        transform: (_doc: any, ret: any) => {
            delete ret._id;
            delete ret.__v;
        },
    });

    schema.set("toObject", {
        virtuals: true,
        transform: (_doc: any, ret: any) => {
            delete ret._id;
            delete ret.__v;
        },
    });

    return model(name, schema, undefined, {
        overwriteModels: process.env.NODE_ENV === "development",
    });
}
