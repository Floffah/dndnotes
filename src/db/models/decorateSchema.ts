import { Schema } from "mongoose";

export function decorateSchema<S extends Schema>(schema: S) {
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

    return schema as S;
}
