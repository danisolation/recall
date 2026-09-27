import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ProgressController } from "./progress.controller";
import { ProgressRepository } from "./progress.repository";

@Module({
  imports: [AuthModule],
  controllers: [ProgressController],
  providers: [ProgressRepository],
})
export class ProgressModule {}
