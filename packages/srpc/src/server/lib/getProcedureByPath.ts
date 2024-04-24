import {
    ProtoBuilderProcedure,
    ProtoBuilderRouter,
    ProtoBuilderType,
} from "@/server";

export const getProcedureByPath = <
    TraversingRouter extends ProtoBuilderRouter<any>,
>(
    path: string,
    currentRouter: TraversingRouter,
): ProtoBuilderProcedure<any, any> | undefined => {
    const parts = path.split(".");

    const field = parts.reduce<
        ProtoBuilderRouter<any> | ProtoBuilderProcedure<any, any>
    >(
        (acc, part) =>
            acc._defs.builderType === ProtoBuilderType.Router
                ? acc?._defs.fields[part]
                : null,
        currentRouter,
    );

    if (!field || field._defs.builderType !== ProtoBuilderType.Procedure) {
        return undefined;
    }

    return field as ProtoBuilderProcedure<any, any>;
};
