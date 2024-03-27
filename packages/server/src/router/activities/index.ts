import cryptoRandomString from "crypto-random-string";
import { z } from "zod";

import { UserSessionType } from "@dndnotes/models";
import { createErrorResponse } from "@dndnotes/web/src/app/api/apiResponse";

import { UserModel, UserSessionModel } from "@/models";
import { procedure, router } from "@/router/context";

export const discordActivitiesRouter = router({});
