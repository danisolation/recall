import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CreateSetService } from "./create-set.service";
import { SetsRepository } from "./sets.repository";
import { SetsController } from "./sets.controller";

@Module({
  imports: [AuthModule],
  controllers: [SetsController],
  providers: [CreateSetService, SetsRepository],
})
export class SetsModule {}
