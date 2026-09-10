import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { LoginService } from "./login.service";
import { RegisterService } from "./register.service";
import { UsersRepository } from "./users.repository";

@Module({
  controllers: [AuthController],
  providers: [RegisterService, LoginService, UsersRepository],
})
export class AuthModule {}
