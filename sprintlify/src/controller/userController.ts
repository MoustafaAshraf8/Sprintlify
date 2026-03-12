import { Context } from "hono";
import { AppContext } from "../types/AppContext";
import { UpdateUserDto } from "../dto/userDto";
import * as userService from "../service/userService";

const getCtxVars = (c: Context<AppContext>) => ({
  drizzleClient: c.get("drizzleClient"),
  supabaseClient: c.get("supabaseClient"),
  userId: c.get("user").id,
});

const getStatus = (message: string) =>
  message === "User not found"
    ? 404
    : message === "Username already taken"
      ? 409
      : 400;

// ─── get all ──────────────────────────────────────────────────────────────────

export const getUsers = async (c: Context<AppContext>) => {
  try {
    const { drizzleClient, supabaseClient } = getCtxVars(c);
    const result = await userService.getAllUsers({
      drizzleClient,
      supabaseClient,
    });
    return c.json(result, 200);
  } catch (err: any) {
    return c.json({ message: err.message }, getStatus(err.message));
  }
};

// ─── get current user ─────────────────────────────────────────────────────────

export const getCurrentUser = async (c: Context<AppContext>) => {
  try {
    const { drizzleClient, supabaseClient, userId } = getCtxVars(c);
    const result = await userService.getCurrentUser({
      drizzleClient,
      supabaseClient,
      userId,
    });
    return c.json(result, 200);
  } catch (err: any) {
    return c.json({ message: err.message }, getStatus(err.message));
  }
};

// ─── update current user ──────────────────────────────────────────────────────

export const updateCurrentUser = async (c: Context<AppContext>) => {
  const body = await c.req.json();
  const parsed = UpdateUserDto.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);

  try {
    const { drizzleClient, supabaseClient, userId } = getCtxVars(c);
    const result = await userService.updateCurrentUser({
      drizzleClient,
      supabaseClient,
      userId,
      data: parsed.data,
    });
    return c.json(result, 200);
  } catch (err: any) {
    return c.json({ message: err.message }, getStatus(err.message));
  }
};
