import { ZodNull, ZodType, ZodUndefined, ZodVoid, z } from "zod";

import {
    ProcedureType,
    ServerError,
    ServerErrorCode,
    TransformerLike,
    defaultTransformer,
} from "@/shared";

export enum ProtoBuilderType {
    Procedure,
    Router,
}

export interface ProtoBuilder<Context = unknown, AuthInput = any> {
    _defs: {
        context: Context;
        transformer: TransformerLike;
        authInput: AuthInput;
    };

    context: <NewContext>() => ProtoBuilder<NewContext, AuthInput>;
    authInput: <NewAuthInput>(
        authInput?: NewAuthInput,
    ) => ProtoBuilder<Context, NewAuthInput>;
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

export type InferInput<Input> = Input extends undefined | void
    ? void
    : Input extends ZodType
      ? Input extends ZodVoid | ZodUndefined | ZodNull
          ? void
          : z.infer<Input>
      : Input;

export type ProtoBuilderProcedureExecutor<Context, Input, Output> = (opts: {
    input: InferInput<Input>;
    ctx: Context;
}) => Promise<Output> | Output;

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
    ) => ProtoBuilderProcedure<Context, Input, NewOutput, ProcedureType.QUERY>;
    mutation: <NewOutput>(
        executor: ProtoBuilderProcedureExecutor<Context, Input, NewOutput>,
    ) => ProtoBuilderProcedure<
        Context,
        Input,
        NewOutput,
        ProcedureType.MUTATION
    >;
}

export interface ProtoBuilderRouter<
    Fields extends Record<
        string,
        ProtoBuilderRouter<any, any> | ProtoBuilderProcedure<any, any>
    >,
    Context = unknown,
    AuthInput = any,
> {
    _defs: {
        builderType: ProtoBuilderType.Router;
        fields: Fields;
        context: Context;
        authInput: AuthInput;
        transformer: TransformerLike;
    };
}

export function createProtoBuilder<Context = unknown, AuthInput = any>(opts?: {
    transformer?: TransformerLike;
    authInput?: AuthInput;
}): ProtoBuilder<Context> {
    const transformer = opts?.transformer ?? defaultTransformer;

    return {
        _defs: {
            context: {} as Context,
            transformer,
            authInput: opts?.authInput,
        },
        context: <NewContext>() => createProtoBuilder<NewContext>(opts),
        authInput: <NewAuthInput>(authInput?: NewAuthInput) =>
            createProtoBuilder<Context, NewAuthInput>({
                transformer,
                authInput,
            }),
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
                    authInput: opts?.authInput,
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
                ProcedureType.QUERY,
                transformer,
                executor,
            );
        },
        mutation: (executor) => {
            return createProtoBuilderProcedure(
                input,
                ProcedureType.MUTATION,
                transformer,
                executor,
            );
        },
    };
}
