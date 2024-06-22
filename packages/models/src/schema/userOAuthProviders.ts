import {
    index,
    int,
    mysqlTable,
    serial,
    varchar,
} from "drizzle-orm/mysql-core";

import { oAuthProviderEnum } from "@/schema/enums";

export const userOAuthProviders = mysqlTable(
    "user_oauth_providers",
    {
        id: serial("id").primaryKey(),
        userId: int("user_id").notNull(),
        provider: oAuthProviderEnum.notNull(),
        providerUserId: varchar("provider_user_id", { length: 256 }).notNull(),
    },
    (userOAuthProviders) => {
        return {
            userIdIndex: index("user_id_idx").on(userOAuthProviders.userId),
            providerUserIdIndex: index("provider_user_id_idx").on(
                userOAuthProviders.providerUserId,
            ),
        };
    },
);

export type UserOAuthProvider = typeof userOAuthProviders.$inferSelect;
