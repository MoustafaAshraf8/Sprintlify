import { KVNamespace } from "@cloudflare/workers-types";
import { DrizzleClientType } from "./drizzleClientType";
import { SupabaseClientType } from "./supabaseClientType";

type Bindings = {
  KVCASH: KVNamespace;
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
