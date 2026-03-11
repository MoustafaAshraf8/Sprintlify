import { createFactory } from "hono/factory";
import { DrizzleClientType } from "./drizzleClientType";
import { SupabaseClientType } from "./supabaseClientType";

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_DB_URL: string;
  SUPABASE_ANON_KEY: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
};

type Variables = {
  supabaseClient: SupabaseClientType;
  drizzleClient: DrizzleClientType;
  user: { id: string; securityLevel: string };
};

export type AppContext = {
  Bindings: Bindings;
  Variables: Variables;
};
