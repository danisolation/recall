import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { FoldersController } from "./folders.controller";
import { FoldersRepository } from "./folders.repository";

// FOLD-004 adds the controller; the repository stays exported for the sets
// module's placement checks (FOLD-004's set-write wiring).
@Module({
  imports: [AuthModule],
  controllers: [FoldersController],
  providers: [FoldersRepository],
  exports: [FoldersRepository],
})
export class FoldersModule {}
