import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../../drizzle/schema";
import * as relations from "../../drizzle/relations";

const dummyClient = drizzle({} as any, {
  schema: { ...schema, ...relations },
});

export type DrizzleClientType = typeof dummyClient;
