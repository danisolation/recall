import { describe, expect, it, vi } from "vitest";
import { CreateCardService } from "./create-card.service";
import type { CardsRepository } from "./cards.repository";

function createCardsRepositoryMock() {
  return {
    create: vi.fn(),
  } as unknown as CardsRepository;
}

describe("CreateCardService", () => {
  it("creates a card in the given set", async () => {
    const cardsRepository = createCardsRepositoryMock();
    const row = {
      id: 3,
      setId: 5,
      front: "Front",
      back: "Back",
      position: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(cardsRepository.create).mockResolvedValue(row);

    const service = new CreateCardService(cardsRepository);
    const result = await service.create(7, 5, {
      front: "Front",
      back: "Back",
    });

    expect(cardsRepository.create).toHaveBeenCalledWith(5, 7, {
      front: "Front",
      back: "Back",
    });
    expect(result).toEqual(row);
  });

  it("returns null when the set is missing or foreign; the controller 404s", async () => {
    const cardsRepository = createCardsRepositoryMock();
    vi.mocked(cardsRepository.create).mockResolvedValue(null);

    const service = new CreateCardService(cardsRepository);

    await expect(
      service.create(7, 999, { front: "F", back: "B" }),
    ).resolves.toBeNull();
  });
});
