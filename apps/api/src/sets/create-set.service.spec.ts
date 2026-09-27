import { NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { CreateSetService } from "./create-set.service";
import type { FoldersRepository } from "../folders/folders.repository";
import type { SetsRepository } from "./sets.repository";

function createSetsRepositoryMock() {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    listByOwner: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as SetsRepository;
}

function createFoldersRepositoryMock() {
  return {
    listByUser: vi.fn(),
    create: vi.fn(),
    rename: vi.fn(),
    remove: vi.fn(),
    isOwnedBy: vi.fn(),
  } as unknown as FoldersRepository;
}

describe("CreateSetService", () => {
  it("creates a set owned by the given user", async () => {
    const setsRepository = createSetsRepositoryMock();
    const foldersRepository = createFoldersRepositoryMock();
    const row = {
      id: 1,
      ownerId: 7,
      folderId: null,
      visibility: "private",
      title: "Biology basics",
      description: "Cells",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(setsRepository.create).mockResolvedValue(row);

    const service = new CreateSetService(setsRepository, foldersRepository);
    const result = await service.create(7, {
      title: "Biology basics",
      description: "Cells",
    });

    expect(setsRepository.create).toHaveBeenCalledWith(7, {
      title: "Biology basics",
      description: "Cells",
    });
    expect(result).toEqual(row);
  });

  it("passes an absent description through", async () => {
    const setsRepository = createSetsRepositoryMock();
    const foldersRepository = createFoldersRepositoryMock();
    vi.mocked(setsRepository.create).mockResolvedValue({
      id: 1,
      ownerId: 7,
      folderId: null,
      visibility: "private",
      title: "No description",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const service = new CreateSetService(setsRepository, foldersRepository);
    await service.create(7, { title: "No description" });

    expect(setsRepository.create).toHaveBeenCalledWith(7, {
      title: "No description",
    });
  });

  it("files a new set into one of the caller's folders", async () => {
    const setsRepository = createSetsRepositoryMock();
    const foldersRepository = createFoldersRepositoryMock();
    vi.mocked(foldersRepository.isOwnedBy).mockResolvedValue(true);
    vi.mocked(setsRepository.create).mockResolvedValue({
      id: 1,
      ownerId: 7,
      folderId: 9,
      visibility: "private",
      title: "Biology basics",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const service = new CreateSetService(setsRepository, foldersRepository);
    await service.create(7, { title: "Biology basics", folderId: 9 });

    expect(foldersRepository.isOwnedBy).toHaveBeenCalledWith(9, 7);
    expect(setsRepository.create).toHaveBeenCalledWith(7, {
      title: "Biology basics",
      folderId: 9,
    });
  });

  it("rejects a foreign folderId before creating anything", async () => {
    const setsRepository = createSetsRepositoryMock();
    const foldersRepository = createFoldersRepositoryMock();
    vi.mocked(foldersRepository.isOwnedBy).mockResolvedValue(false);

    const service = new CreateSetService(setsRepository, foldersRepository);

    await expect(
      service.create(7, { title: "Biology basics", folderId: 99 }),
    ).rejects.toMatchObject({
      response: { code: "FOLDER_NOT_FOUND" },
    });
    expect(setsRepository.create).not.toHaveBeenCalled();
  });
});
