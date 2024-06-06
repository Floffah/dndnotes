import {
    HydratedDocument,
    InferSchemaType,
    Model,
    ObtainSchemaGeneric,
    Schema,
    model,
    models,
} from "mongoose";

type MongooseCreateModelReturn<TSchema extends Schema> = Model<
    InferSchemaType<TSchema>,
    ObtainSchemaGeneric<TSchema, "TQueryHelpers">,
    ObtainSchemaGeneric<TSchema, "TInstanceMethods">,
    ObtainSchemaGeneric<TSchema, "TVirtuals">,
    HydratedDocument<
        InferSchemaType<TSchema>,
        ObtainSchemaGeneric<TSchema, "TVirtuals"> &
            ObtainSchemaGeneric<TSchema, "TInstanceMethods">,
        ObtainSchemaGeneric<TSchema, "TQueryHelpers">
    >,
    TSchema
> &
    ObtainSchemaGeneric<TSchema, "TStaticMethods">;
// type MongooseCreateModelReturn<TSchema extends Schema> = ReturnType<typeof model<TSchema>>;

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

    if (process.env.NODE_ENV === "production" && name in models) {
        return models[name] as MongooseCreateModelReturn<S>;
    }

    return model(name, schema, undefined, {
        overwriteModels: process.env.NODE_ENV === "development",
    });
}
