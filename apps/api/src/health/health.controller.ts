import { Controller, Get, Inject } from "@nestjs/common";
import { sql } from "@danisolation-recall/database";
import { DATABASE_PROVIDER, type Database } from "../database/database.module";

@Controller("health")
export class HealthController {
  constructor(@Inject(DATABASE_PROVIDER) private readonly db: Database) {}

  @Get()
  async check(): Promise<{ status: string }> {
    await this.db.execute(sql`SELECT 1`);
    return { status: "ok" };
  }
}
