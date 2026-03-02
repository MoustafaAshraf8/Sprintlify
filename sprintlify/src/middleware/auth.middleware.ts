import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Context, MiddlewareHandler } from "hono";
import { env } from "hono/adapter";

declare module "hono" {
  interface ContextVariableMap {
    supabase: SupabaseClient;
  }
}

export const getSupabase = (c: Context) => c.get("supabase");

type SupabaseEnv = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
};

export const supabaseMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const { SUPABASE_URL, SUPABASE_ANON_KEY } = env<SupabaseEnv>(c);

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    c.set("supabase", supabase);
    await next();
  };
};
