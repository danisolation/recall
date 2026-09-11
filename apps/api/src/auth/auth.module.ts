import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { AuthController } from "./auth.controller";
import { LoginService } from "./login.service";
import { RegisterService } from "./register.service";
import { SessionService } from "./session";
import { UsersRepository } from "./users.repository";

@Module({
  imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10 }])],
  controllers: [AuthController],
  providers: [RegisterService, LoginService, SessionService, UsersRepository],
})
export class AuthModule {}
