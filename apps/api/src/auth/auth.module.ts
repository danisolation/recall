import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { RegisterService } from "./register.service";
import { UsersRepository } from "./users.repository";

@Module({
  controllers: [AuthController],
  providers: [RegisterService, UsersRepository],
})
export class AuthModule {}
