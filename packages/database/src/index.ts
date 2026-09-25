import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export function createDb(connectionString: string) {
  const pool = new Pool({ connectionString });
  return drizzle(pool, { schema });
}

export {
  and,
  asc,
  desc,
  eq,
  gt,
  gte,
  lt,
  lte,
  sql,
} from "drizzle-orm";
export * from "./schema";
