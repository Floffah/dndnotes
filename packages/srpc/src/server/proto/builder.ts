import {
    ServerError,
    ServerErrorCode,
    TransformerLike,
    defaultTransformer,
} from "src/shared";
import { ZodNull, ZodType, ZodUndefined, ZodVoid, z } from "zod";

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
    procedure: <Input = ZodVoid>(
        input?: Input,
    ) => ProtoBuilderProcedure<Context, Input>;
    router: <
        Fields extends Record<
            string,
            | ProtoBuilderRouter<any, Context>
            | ProtoBuilderProcedure<Context, any>
        >,
    >(
        fields: Fields,
    ) => ProtoBuilderRouter<Fields, Context>;
}

export type InferProcedureInput<Input> = Input extends undefined | void
    ? void
    : Input extends ZodType
      ? Input extends ZodVoid | ZodUndefined | ZodNull
          ? void
          : z.infer<Input>
      : Input;

export type ProtoBuilderProcedureExecutor<Context, Input, Output> = (opts: {
    input: InferProcedureInput<Input>;
    ctx: Context;
}) => Promise<Output> | Output;

export enum ProcedureType {
    Query,
    Mutation,
}

export interface ProtoBuilderProcedure<
    Context,
    Input,
    Output = any,
    Type extends ProcedureType = ProcedureType,
> {
    _defs: {
        name: string;
        builderType: ProtoBuilderType.Procedure;
        input: Input;
        output: Output;
        context: Context;
        executor: ProtoBuilderProcedureExecutor<Context, Input, Output>;
        type: Type;
        transformer: TransformerLike;
    };

    query: <NewOutput>(
        executor: ProtoBuilderProcedureExecutor<Context, Input, NewOutput>,
    ) => ProtoBuilderProcedure<Context, Input, NewOutput, ProcedureType.Query>;
    mutation: <NewOutput>(
        executor: ProtoBuilderProcedureExecutor<Context, Input, NewOutput>,
    ) => ProtoBuilderProcedure<
        Context,
        Input,
        NewOutput,
        ProcedureType.Mutation
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
        procedure: <Input>(input?: Input) =>
            createProtoBuilderProcedure(
                (input ?? z.void()) as Input,
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
    Context,
    Input,
    Output = any,
    Type extends ProcedureType = ProcedureType,
>(
    input: Input,
    type?: Type,
    transformer?: TransformerLike,
    executor?: ProtoBuilderProcedureExecutor<Context, Input, Output>,
): ProtoBuilderProcedure<Context, Input, Output, Type> {
    return {
        _defs: {
            name: "",
            builderType: ProtoBuilderType.Procedure,
            input,
            output: {} as Output,
            context: {} as Context,
            executor:
                executor ??
                (() => {
                    throw new ServerError({
                        code: ServerErrorCode.BAD_REQUEST,
                        message: "Not implemented",
                    });
                }),
            type: type as Type,
            transformer: transformer ?? defaultTransformer,
        },
        query: (executor) => {
            return createProtoBuilderProcedure(
                input,
                ProcedureType.Query,
                transformer,
                executor,
            );
        },
        mutation: (executor) => {
            return createProtoBuilderProcedure(
                input,
                ProcedureType.Mutation,
                transformer,
                executor,
            );
        },
    };
}
