import { z } from "zod";

import { ProtoBuilderRouter, ProtoBuilderType } from "@/server";

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
