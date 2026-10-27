import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://fungames:fungames@localhost:5432/fungames";

const client = postgres(databaseUrl, { max: 10 });

export const db = drizzle(client, { schema });
export * from "./schema";
