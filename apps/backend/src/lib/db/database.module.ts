import {Module} from "@nestjs/common";
import {databaseProviders} from "@/lib/db/database.providers";

@Module({
    providers: [...databaseProviders],
    exports: [...databaseProviders],
})
export class DatabaseModule {}