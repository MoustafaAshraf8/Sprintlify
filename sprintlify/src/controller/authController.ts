import { Context } from "hono";
import { AppContext } from "../types/AppContext";
import { RegisterDto, LoginDto, RefreshDto } from "../dto/authDto";
import * as authService from "../service/authService";
import { getCtxVars } from "../helper/getCtxVars";
// ─── register ─────────────────────────────────────────────────────────────────

export const register = async (c: Context<AppContext>) => {
  const body = await c.req.json();
  const parsed = RegisterDto.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);

  const { drizzleClient, supabaseClient, jwtSecret, jwtRefreshSecret } =
    getCtxVars(c);
  const result = await authService.register({
    drizzleClient: drizzleClient,
    supabaseClient: supabaseClient,
    jwtSecret: jwtSecret,
    jwtRefreshSecret: jwtRefreshSecret,
    data: parsed.data,
  });
  return c.json(result, 201);
};

// ─── login ────────────────────────────────────────────────────────────────────

export const login = async (c: Context<AppContext>) => {
  const body = await c.req.json();
  const parsed = LoginDto.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);

  const { drizzleClient, supabaseClient, jwtSecret, jwtRefreshSecret } =
    getCtxVars(c);
  const result = await authService.login({
    drizzleClient: drizzleClient,
    supabaseClient: supabaseClient,
    jwtSecret: jwtSecret,
    jwtRefreshSecret: jwtRefreshSecret,
    data: parsed.data,
  });
  return c.json(result, 200);
};

// ─── refresh ──────────────────────────────────────────────────────────────────

export const refresh = async (c: Context<AppContext>) => {
  const body = await c.req.json();
  const parsed = RefreshDto.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);

  const { drizzleClient, supabaseClient, jwtSecret, jwtRefreshSecret } =
    getCtxVars(c);
  const result = await authService.refresh({
    drizzleClient: drizzleClient,
    supabaseClient: supabaseClient,
    jwtSecret: jwtSecret,
    jwtRefreshSecret: jwtRefreshSecret,
    data: parsed.data,
  });
  return c.json(result, 200);
};

// ─── authenticate ─────────────────────────────────────────────────────────────

export const authenticate = async (c: Context<AppContext>) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const token = authHeader.split(" ")[1];

  const { drizzleClient, supabaseClient, jwtSecret, jwtRefreshSecret } =
    getCtxVars(c);
  const user = await authService.authenticate({
    drizzleClient: drizzleClient,
    supabaseClient: supabaseClient,
    jwtSecret: jwtSecret,
    jwtRefreshSecret: jwtRefreshSecret,
    token: token,
  });
  return c.json({ user }, 200);
};

// ─── logout ───────────────────────────────────────────────────────────────────

export const logout = async (c: Context<AppContext>) => {
  const body = await c.req.json();
  const parsed = RefreshDto.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);

  const { drizzleClient, supabaseClient } = getCtxVars(c);
  await authService.logout({
    drizzleClient,
    supabaseClient,
    refreshToken: parsed.data.refreshToken,
  });
  return c.json({ message: "Logged out successfully" }, 200);
};

