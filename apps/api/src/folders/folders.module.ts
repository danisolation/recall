import { Module } from "@nestjs/common";
import { FoldersRepository } from "./folders.repository";

// FOLD-003: repository only — the controller arrives with FOLD-004, and the
// sets module consumes the placement check, so the repository is exported.
@Module({
  providers: [FoldersRepository],
  exports: [FoldersRepository],
})
export class FoldersModule {}
