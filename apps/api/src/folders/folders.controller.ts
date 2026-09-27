import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { createFolderSchema } from "@danisolation-recall/contracts";
import { createZodDto } from "nestjs-zod";
import { AuthGuard, CurrentUser } from "../auth/auth.guard";
import { type User } from "../auth/users.repository";
import {
  type Folder,
  type FolderWithCount,
  FoldersRepository,
} from "./folders.repository";

export class CreateFolderDto extends createZodDto(createFolderSchema) {}

export class RenameFolderDto extends createZodDto(createFolderSchema) {}

function parseFolderId(folderId: string): number {
  const id = Number(folderId);

  if (!Number.isInteger(id)) {
    throw new NotFoundException({
      code: "FOLDER_NOT_FOUND",
      message: "Folder not found",
    });
  }

  return id;
}

// ADR-014: the folders CRUD — the dashboard's folder navigation and the
// /folders management page. Ownership lives in the repository's WHERE
// clauses (§41), so a foreign folder folds into 404 FOLDER_NOT_FOUND, and
// a duplicate name translates into 409 FOLDER_NAME_TAKEN — the house
// register's conflict status, as with REVIEW_ALREADY_RECORDED.
@Controller("folders")
export class FoldersController {
  constructor(private readonly foldersRepository: FoldersRepository) {}

  @Get()
  @UseGuards(AuthGuard)
  async list(@CurrentUser() user: User): Promise<FolderWithCount[]> {
    return this.foldersRepository.listByUser(user.id);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @CurrentUser() user: User,
    @Body() body: CreateFolderDto,
  ): Promise<Folder> {
    const folder = await this.foldersRepository.create(user.id, body.name);

    if (folder === "conflict") {
      throw new ConflictException({
        code: "FOLDER_NAME_TAKEN",
        message: "A folder with this name already exists",
      });
    }

    return folder;
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  async rename(
    @CurrentUser() user: User,
    @Param("id") folderId: string,
    @Body() body: RenameFolderDto,
  ): Promise<Folder> {
    const result = await this.foldersRepository.rename(
      parseFolderId(folderId),
      user.id,
      body.name,
    );

    if (result.outcome === "notFound") {
      throw new NotFoundException({
        code: "FOLDER_NOT_FOUND",
        message: "Folder not found",
      });
    }

    if (result.outcome === "conflict") {
      throw new ConflictException({
        code: "FOLDER_NAME_TAKEN",
        message: "A folder with this name already exists",
      });
    }

    return result.folder;
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async remove(
    @CurrentUser() user: User,
    @Param("id") folderId: string,
  ): Promise<void> {
    const removed = await this.foldersRepository.remove(
      parseFolderId(folderId),
      user.id,
    );

    if (!removed) {
      throw new NotFoundException({
        code: "FOLDER_NOT_FOUND",
        message: "Folder not found",
      });
    }
  }
}
