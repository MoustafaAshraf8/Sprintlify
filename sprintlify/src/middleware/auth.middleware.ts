import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Context, MiddlewareHandler } from "hono";
import { env } from "hono/adapter";
import { Bindings } from "../bindings";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { Database } from "../../db/database.types";
import * as schema from "../../drizzle/schema";
import * as relations from "../../drizzle/relations";
declare module "hono" {
  interface ContextVariableMap {
    supabase: SupabaseClient;
  }
}

export const getSupabase = (c: Context) => c.get("supabase");
export const getDrizzleClient = (c: Context) => c.get("drizzleClient");

export const supabaseMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const { SUPABASE_URL, SUPABASE_DB_URL, SUPABASE_ANON_KEY } = c.env;
    const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
    c.set("supabase", supabase);

    const client = postgres(SUPABASE_DB_URL, { prepare: false });
    const drizzleClient = drizzle(client, {
      schema: { ...schema, ...relations },
    });
    c.set("drizzleClient", drizzleClient);

    await next();
  };
};
