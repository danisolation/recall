import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CreateSetService } from "./create-set.service";
import { PublicSetsController, SetsController } from "./sets.controller";
import { SetsRepository } from "./sets.repository";

@Module({
  imports: [AuthModule],
  controllers: [SetsController, PublicSetsController],
  providers: [CreateSetService, SetsRepository],
})
export class SetsModule {}
