import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { SetTagsController, TagsController } from "./tags.controller";
import { TagsRepository } from "./tags.repository";

@Module({
  imports: [AuthModule],
  controllers: [TagsController, SetTagsController],
  providers: [TagsRepository],
})
export class TagsModule {}
