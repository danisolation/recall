import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { AuthController } from "./auth.controller";
import { LoginService } from "./login.service";
import { RegisterService } from "./register.service";
import { SessionService } from "./session";
import { UsersRepository } from "./users.repository";

@Module({
  imports: [
    // Applies to routes guarded by RateLimitGuard (currently login only).
    // Configurable so E2E runs, which log in repeatedly, can raise the ceiling.
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: Number(config.get("THROTTLE_TTL_MS") ?? 60_000),
          limit: Number(config.get("THROTTLE_LIMIT") ?? 5),
        },
      ],
    }),
  ],
  controllers: [AuthController],
  providers: [RegisterService, LoginService, SessionService, UsersRepository],
  exports: [SessionService],
})
export class AuthModule {}
