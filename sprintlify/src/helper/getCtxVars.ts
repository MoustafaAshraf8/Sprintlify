import { Context } from "hono";
import { AppContext } from "../types/AppContext";

export const getCtxVars = (c: Context<AppContext>) => ({
  drizzleClient: c.get("drizzleClient"),
  supabaseClient: c.get("supabaseClient"),
  user: c.get("user"),
  jwtSecret: c.env.JWT_SECRET,
  jwtRefreshSecret: c.env.JWT_REFRESH_SECRET,
});
