import { Post, UsePipes, applyDecorators } from "@nestjs/common";
import { ZodSchema } from "zod";

import { SuperjsonPipe } from "@/lib/pipes/superjson.pipe";
import { ZodValidationPipe } from "@/lib/pipes/zod.pipe";

export function Mutation(schema: ZodSchema) {
    return applyDecorators(
        UsePipes(new SuperjsonPipe()),
        UsePipes(new ZodValidationPipe(schema)),
        Post(),
    );
}
