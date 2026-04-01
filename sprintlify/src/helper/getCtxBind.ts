import { Context } from "hono";
import { AppContext } from "../types/AppContext";

export const getCtxBind = (c: Context<AppContext>) => ({
  kv: c.env.KVCASH,
});
