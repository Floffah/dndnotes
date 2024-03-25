import { ZodType, z } from "zod";

import { TransformerLike, defaultTransformer } from "@/shared";

export enum ProtoBuilderType {
    Procedure,
    Router,
}

export interface ProtoBuilder<Context = unknown> {
    _defs: {
        context: Context;
        transformer: TransformerLike;
    };

    context: <NewContext>() => ProtoBuilder<NewContext>;
    procedure: <Input extends ZodType>(
        input: Input,
    ) => ProtoBuilderProcedure<Input, Context>;
    router: <
        Fields extends Record<
            string,
            | ProtoBuilderRouter<any, Context>
            | ProtoBuilderProcedure<any, Context>
        >,
    >(
        fields: Fields,
    ) => ProtoBuilderRouter<Fields, Context>;
}

export type ProtoBuilderProcedureExecutor<
    Context,
    Input extends ZodType,
    Output = unknown,
> = (opts: { input: z.infer<Input>; ctx: Context }) => Promise<Output> | Output;

export enum ProcedureType {
    Query,
    Mutation,
}

export interface ProtoBuilderProcedure<
    Input extends ZodType = ZodType,
    Context = unknown,
    Type extends ProcedureType = ProcedureType,
    Executor extends ProtoBuilderProcedureExecutor<
        Context,
        z.infer<Input>
    > = ProtoBuilderProcedureExecutor<Context, z.infer<Input>>,
> {
    _defs: {
        name: string;
        builderType: ProtoBuilderType.Procedure;
        input: Input;
        output: Promise<Awaited<ReturnType<Executor>>>;
        context: Context;
        executor: Executor;
        type: Type;
        transformer: TransformerLike;
    };

    query: <NewExecutor extends ProtoBuilderProcedureExecutor<Context, Input>>(
        executor: NewExecutor,
    ) => ProtoBuilderProcedure<
        Input,
        Context,
        ProcedureType.Query,
        NewExecutor
    >;
    mutation: <
        NewExecutor extends ProtoBuilderProcedureExecutor<Context, Input>,
    >(
        executor: NewExecutor,
    ) => ProtoBuilderProcedure<
        Input,
        Context,
        ProcedureType.Mutation,
        NewExecutor
    >;
}

export interface ProtoBuilderRouter<
    Fields extends Record<
        string,
        ProtoBuilderRouter<any, any> | ProtoBuilderProcedure<any, any>
    >,
    Context = unknown,
> {
    _defs: {
        builderType: ProtoBuilderType.Router;
        fields: Fields;
        context: Context;
        transformer: TransformerLike;
    };
}
//
export function createProtoBuilder<Context = unknown>(opts?: {
    transformer?: TransformerLike;
}): ProtoBuilder<Context> {
    const transformer = opts?.transformer ?? defaultTransformer;

    return {
        _defs: {
            context: {} as Context,
            transformer,
        },
        context: <NewContext>() => createProtoBuilder<NewContext>(opts),
        procedure: (input) =>
            createProtoBuilderProcedure(
                input,
                undefined,
                undefined,
                transformer,
            ),
        router: (fields) => {
            for (const [name, field] of Object.entries(fields)) {
                if (
                    "_defs" in field &&
                    field._defs.builderType === ProtoBuilderType.Procedure
                ) {
                    field._defs.name = name;
                }
            }

            return {
                _defs: {
                    builderType: ProtoBuilderType.Router,
                    fields,
                    context: {} as Context,
                    transformer,
                },
            } as ProtoBuilderRouter<typeof fields, Context>;
        },
    };
}

export function createProtoBuilderProcedure<
    Input extends ZodType,
    Context = unknown,
    Type extends ProcedureType = ProcedureType,
    Executor extends ProtoBuilderProcedureExecutor<
        Context,
        z.infer<Input>
    > = ProtoBuilderProcedureExecutor<Context, z.infer<Input>>,
>(
    input: Input,
    type?: Type,
    executor?: Executor,
    transformer?: TransformerLike,
): ProtoBuilderProcedure<Input, Context, Type, Executor> {
    return {
        _defs: {
            name: "",
            builderType: ProtoBuilderType.Procedure,
            input,
            output: {} as Promise<Awaited<ReturnType<Executor>>>,
            context: {} as Context,
            executor: executor as Executor,
            type: type as Type,
            transformer: transformer ?? defaultTransformer,
        },
        query: (executor) => {
            return createProtoBuilderProcedure(
                input,
                ProcedureType.Query,
                executor,
                transformer,
            );
        },
        mutation: (executor) => {
            return createProtoBuilderProcedure(
                input,
                ProcedureType.Mutation,
                executor,
                transformer,
            );
        },
    };
}
