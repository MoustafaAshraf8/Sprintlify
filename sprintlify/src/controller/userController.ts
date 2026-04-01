import { Context } from "hono";
import { AppContext } from "../types/AppContext";
import { UpdateUserDto } from "../dto/userDto";
import * as userService from "../service/userService";
import { getCtxVars } from "../helper/getCtxVars";
import { getCtxBind } from "../helper/getCtxBind";

// ─── get all ──────────────────────────────────────────────────────────────────

export const getUsers = async (c: Context<AppContext>) => {
  const { drizzleClient, supabaseClient, user } = getCtxVars(c);
  const { kv } = getCtxBind(c);
  const result = await userService.getAllUsers({
    drizzleClient,
    supabaseClient,
    kv,
  });
  return c.json(result, 200);
};

// ─── get current user ─────────────────────────────────────────────────────────

export const getCurrentUser = async (c: Context<AppContext>) => {
  const { drizzleClient, supabaseClient, user } = getCtxVars(c);
  const { kv } = getCtxBind(c);
  const result = await userService.getCurrentUser({
    drizzleClient,
    supabaseClient,
    kv,
    userId: user.id,
  });
  return c.json(result, 200);
};

// ─── update current user ──────────────────────────────────────────────────────

export const updateCurrentUser = async (c: Context<AppContext>) => {
  const body = await c.req.json();
  const parsed = UpdateUserDto.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);

  const { drizzleClient, supabaseClient, user } = getCtxVars(c);
  const { kv } = getCtxBind(c);
  const result = await userService.updateCurrentUser({
    drizzleClient,
    supabaseClient,
    kv,
    userId: user.id,
    data: parsed.data,
  });
  return c.json(result, 200);
};
