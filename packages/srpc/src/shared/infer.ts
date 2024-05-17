import { ProcedureType } from "./procedure";
import { z } from "zod";

import type {
    ProtoBuilderProcedure,
    ProtoBuilderRouter,
    ProtoBuilderType,
} from "@/server";

export type TraverseRouter<Router extends ProtoBuilderRouter<any>> = {
    [K in keyof Router["_defs"]["fields"]]: Router["_defs"]["fields"][K]["_defs"]["builderType"] extends ProtoBuilderType.Router
        ? TraverseRouter<Router["_defs"]["fields"][K]>
        : Router["_defs"]["fields"][K];
};

export type InputTypes<Router extends ProtoBuilderRouter<any>> = {
    [K in keyof Router["_defs"]["fields"]]: Router["_defs"]["fields"][K]["_defs"]["builderType"] extends ProtoBuilderType.Router
        ? InputTypes<Router["_defs"]["fields"][K]>
        : z.infer<Router["_defs"]["fields"][K]["_defs"]["input"]>;
};

export type OutputTypes<Router extends ProtoBuilderRouter<any>> = {
    [K in keyof Router["_defs"]["fields"]]: Router["_defs"]["fields"][K]["_defs"]["builderType"] extends ProtoBuilderType.Router
        ? OutputTypes<Router["_defs"]["fields"][K]>
        : Router["_defs"]["fields"][K]["_defs"]["output"];
};

type StringKeys<T> = Extract<keyof T, string>;

// to prevent infinite recursion when using generic types that reference this we need to introduce a max depth
// although hacky, this is a pattern that typescript uses themselves
// see FlatArray in https://github.com/microsoft/TypeScript/blob/main/src/lib/es2019.array.d.ts
export type FlattenProcedureNames<
    T,
    Prefix extends string = "",
    Depth extends number = 9,
> = Depth extends 0
    ? never
    : T extends ProtoBuilderRouter<any, any, any>
      ? {
            [K in keyof T["_defs"]["fields"]]: T["_defs"]["fields"][K] extends ProtoBuilderRouter<
                any,
                any,
                any
            >
                ? FlattenProcedureNames<
                      T["_defs"]["fields"][K],
                      `${Prefix}${Extract<K, string>}.`,
                      [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9][Depth]
                  >
                : `${Prefix}${Extract<K, string>}`;
        }[keyof T["_defs"]["fields"]]
      : never;

export type ProcedureFromPath<
    T,
    Path extends string,
> = Path extends `${infer First}.${infer Rest}`
    ? T extends ProtoBuilderRouter<any, any>
        ? First extends StringKeys<T["_defs"]["fields"]>
            ? ProcedureFromPath<T["_defs"]["fields"][First], Rest>
            : never
        : never
    : T extends ProtoBuilderRouter<any, any>
      ? Path extends StringKeys<T["_defs"]["fields"]>
          ? T["_defs"]["fields"][Path] extends ProtoBuilderProcedure<
                any,
                any,
                any,
                any
            >
              ? T["_defs"]["fields"][Path]
              : never
          : never
      : never;

export type TypedProcedureFromPath<
    T,
    Path extends string,
    Type extends ProcedureType,
> =
    ProcedureFromPath<T, Path> extends ProtoBuilderProcedure<
        any,
        any,
        any,
        Type
    >
        ? ProcedureFromPath<T, Path>
        : never;
