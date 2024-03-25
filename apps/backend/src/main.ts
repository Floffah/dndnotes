import { AppModule } from "./app.module";
import { SESSION_TOKEN } from "@dndnotes/lib";
import { NestFactory } from "@nestjs/core";

import { UserSessionModel } from "@/lib/db/models/UserSessionModel";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(async (req, res, next) => {
        if (req.cookies && req.cookies[SESSION_TOKEN]) {
            const sessionToken = req.cookies[SESSION_TOKEN];

            const userSession = await UserSessionModel.find({
                token: sessionToken,
            })
                .populate("user")
                .exec();

            if (userSession) {
                req.session = userSession;
            }
        }

        next();
    });

    await app.listen(8080);
}

bootstrap();
