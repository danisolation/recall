import {
  type CanActivate,
  type ExecutionContext,
  createParamDecorator,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { SESSION_COOKIE_NAME, SessionService } from "./session";
import { type User } from "./users.repository";

declare module "express-serve-static-core" {
  interface Request {
    currentUser?: User;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.[SESSION_COOKIE_NAME];
    const user = token
      ? await this.sessionService.findUserByToken(token)
      : null;

    if (!user) {
      throw new UnauthorizedException({
        code: "UNAUTHENTICATED",
        message: "Authentication required",
      });
    }

    request.currentUser = user;
    return true;
  }
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User | undefined => {
    return context.switchToHttp().getRequest<Request>().currentUser;
  },
);
