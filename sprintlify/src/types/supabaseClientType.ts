import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../db/database.types";

export type SupabaseClientType = SupabaseClient<Database>;
