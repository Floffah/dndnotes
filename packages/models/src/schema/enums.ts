import { mysqlEnum } from "drizzle-orm/mysql-core";

export const OAuthProvider = mysqlEnum("oauth_provider", ["discord"]);
