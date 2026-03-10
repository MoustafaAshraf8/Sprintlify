import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Context, MiddlewareHandler } from "hono";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { Database } from "../../db/database.types";
import * as schema from "../../drizzle/schema";
import * as relations from "../../drizzle/relations";
import { SupabaseClientType } from "../types/supabaseClientType";
import { DrizzleClientType } from "../types/drizzleClientType";

export const getSupabaseClient = (c: Context) => c.get("supabaseClient");
export const getDrizzleClient = (c: Context) => c.get("drizzleClient");

export const dbAuthMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const { SUPABASE_URL, SUPABASE_DB_URL, SUPABASE_ANON_KEY } = c.env;
    const supabaseClient: SupabaseClientType = createClient<Database>(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
    );
    c.set("supabaseClient", supabaseClient);

    const client = postgres(SUPABASE_DB_URL, { prepare: false });
    const drizzleClient: DrizzleClientType = drizzle(client, {
      schema: { ...schema, ...relations },
    });
    c.set("drizzleClient", drizzleClient);

    await next();
  };
};
