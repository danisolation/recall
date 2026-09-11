import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { LoginService } from "./login.service";
import { RegisterService } from "./register.service";
import { SessionService } from "./session";
import { UsersRepository } from "./users.repository";

@Module({
  controllers: [AuthController],
  providers: [RegisterService, LoginService, SessionService, UsersRepository],
})
export class AuthModule {}
