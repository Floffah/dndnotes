import { UserSession } from "@dndnotes/models";
import { randomBytes } from "crypto";
import type { ObjectId } from "mongodb";
import type { Document } from "mongoose";
import { generateUsername } from "unique-username-generator";

import { UserModel } from "@/models/UserModel";
import { UserSessionModel } from "@/models/UserSessionModel";

export async function createUser<WithSession extends boolean>(
    withSession?: WithSession,
    name = generateUsername("", 2),
) {
    const user = await UserModel.create({
        name,
        email: `${name}@example.com`,
    });

    let session: Document<unknown, {}, UserSession> &
        UserSession & { _id: ObjectId } = null!;

    if (withSession) {
        session = await UserSessionModel.create({
            user,
            token: randomBytes(16).toString("hex"),
            expiresAt: new Date(Date.now() + 1000 * 60),
        });
    }

    return {
        user,
        session: session as WithSession extends true ? typeof session : null,
    };
}
