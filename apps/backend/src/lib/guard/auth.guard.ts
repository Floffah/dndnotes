import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {SESSION_TOKEN} from "@dndnotes/lib";
import {UserSessionModel} from "@/lib/db/models/UserSessionModel";

@Injectable()
export class AuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();

        if (request.session && request.session.user) {
            return true;
        }

        const token = request.cookies[SESSION_TOKEN];

        if (!token) {
            throw new UnauthorizedException();
        }

        const userSession = await UserSessionModel.findOne({
            token,
        }).populate('user').exec();

        if (!userSession) {
            throw new UnauthorizedException();
        }

        request.session = userSession;

        return true;
    }
}