import { describe, expect, it, vi } from "vitest";
import { StartSessionService } from "./start-session.service";
import type { SessionsRepository } from "./sessions.repository";

function createSessionsRepositoryMock() {
  return {
    create: vi.fn(),
    listSessionCards: vi.fn(),
  } as unknown as SessionsRepository;
}

describe("StartSessionService", () => {
  it("starts a session and returns it with the set's ordered cards", async () => {
    const sessionsRepository = createSessionsRepositoryMock();
    const session = {
      id: 5,
      userId: 7,
      setId: 3,
      status: "ACTIVE",
      startedAt: new Date(),
      finishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const cards = [
      {
        id: 11,
        setId: 3,
        front: "Front A",
        back: "Back A",
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 12,
        setId: 3,
        front: "Front B",
        back: "Back B",
        position: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    vi.mocked(sessionsRepository.create).mockResolvedValue(session);
    vi.mocked(sessionsRepository.listSessionCards).mockResolvedValue(cards);

    const service = new StartSessionService(sessionsRepository);
    const result = await service.start(7, { setId: 3 });

    expect(sessionsRepository.create).toHaveBeenCalledWith(7, 3);
    expect(sessionsRepository.listSessionCards).toHaveBeenCalledWith(5, 7);
    expect(result).toEqual({ session, cards });
  });

  it("returns null without touching cards for a foreign or unknown set", async () => {
    const sessionsRepository = createSessionsRepositoryMock();
    vi.mocked(sessionsRepository.create).mockResolvedValue(null);

    const service = new StartSessionService(sessionsRepository);
    const result = await service.start(7, { setId: 99999999 });

    expect(result).toBeNull();
    expect(sessionsRepository.listSessionCards).not.toHaveBeenCalled();
  });
});
