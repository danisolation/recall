import "reflect-metadata";
import { type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import supertest from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../app.module";

describe("auth rate limiting (integration)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("does not throttle registration attempts", async () => {
    for (let i = 0; i < 6; i++) {
      const response = await supertest(app.getHttpServer())
        .post("/auth/register")
        .send({ email: "not-an-email", password: "short" });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe("VALIDATION_ERROR");
    }
  });

  it("throttles login with 429 RATE_LIMITED after 5 attempts per minute", async () => {
    const attempt = () =>
      supertest(app.getHttpServer())
        .post("/auth/login")
        .send({ email: "no-user@example.com", password: "wrong password" });

    for (let i = 0; i < 5; i++) {
      const response = await attempt();
      expect(response.status).toBe(401);
      expect(response.body.code).toBe("INVALID_CREDENTIALS");
    }

    const throttled = await attempt();
    expect(throttled.status).toBe(429);
    expect(throttled.body.code).toBe("RATE_LIMITED");
    expect(throttled.body.message).toBe("Too many attempts. Try again shortly.");
  });
});
