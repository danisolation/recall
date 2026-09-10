import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createDb } from "@danisolation-recall/database";

export const DATABASE_PROVIDER = "DATABASE_PROVIDER";
export type Database = ReturnType<typeof createDb>;

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        createDb(config.getOrThrow<string>("DATABASE_URL")),
    },
  ],
  exports: [DATABASE_PROVIDER],
})
export class DatabaseModule {}
