import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { SessionsController } from "./sessions.controller";
import { SessionsRepository } from "./sessions.repository";
import { StartSessionService } from "./start-session.service";

@Module({
  imports: [AuthModule],
  controllers: [SessionsController],
  providers: [StartSessionService, SessionsRepository],
})
export class SessionsModule {}
