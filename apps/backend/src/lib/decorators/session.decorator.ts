import { UserSession } from "@dndnotes/models";
import { createParamDecorator } from "@nestjs/common";

export const Session = createParamDecorator(
    (_data, req) => req.session as UserSession,
);
