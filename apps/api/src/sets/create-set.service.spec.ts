import { describe, expect, it, vi } from "vitest";
import { CreateSetService } from "./create-set.service";
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

describe("CreateSetService", () => {
  it("creates a set owned by the given user", async () => {
    const setsRepository = createSetsRepositoryMock();
    const row = {
      id: 1,
      ownerId: 7,
      title: "Biology basics",
      description: "Cells",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(setsRepository.create).mockResolvedValue(row);

    const service = new CreateSetService(setsRepository);
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
    vi.mocked(setsRepository.create).mockResolvedValue({
      id: 1,
      ownerId: 7,
      title: "No description",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const service = new CreateSetService(setsRepository);
    await service.create(7, { title: "No description" });

    expect(setsRepository.create).toHaveBeenCalledWith(7, {
      title: "No description",
    });
  });
});
