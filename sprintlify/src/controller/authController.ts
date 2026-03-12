// controllers/auth.controller.ts
import { Context } from "hono";
import { AppContext } from "../types/AppContext";
import { RegisterDto, LoginDto, RefreshDto } from "../dto/authDto";
import * as authService from "../service/authService";

// ─── helpers ──────────────────────────────────────────────────────────────────

const getCtxVars = (c: Context<AppContext>) => ({
  drizzleClient: c.get("drizzleClient"),
  supabaseClient: c.get("supabaseClient"),
  jwtSecret: c.env.JWT_SECRET,
  jwtRefreshSecret: c.env.JWT_REFRESH_SECRET,
});

// ─── register ─────────────────────────────────────────────────────────────────

export const register = async (c: Context<AppContext>) => {
  const body = await c.req.json();
  const parsed = RegisterDto.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);

  try {
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
  } catch (err: any) {
    return c.json({ message: err.message }, 409);
  }
};

// ─── login ────────────────────────────────────────────────────────────────────

export const login = async (c: Context<AppContext>) => {
  const body = await c.req.json();
  const parsed = LoginDto.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);

  try {
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
  } catch (err: any) {
    return c.json({ message: err.message }, 401);
  }
};

// ─── refresh ──────────────────────────────────────────────────────────────────

export const refresh = async (c: Context<AppContext>) => {
  const body = await c.req.json();
  const parsed = RefreshDto.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);

  try {
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
  } catch (err: any) {
    return c.json({ message: err.message }, 401);
  }
};

// ─── authenticate ─────────────────────────────────────────────────────────────

export const authenticate = async (c: Context<AppContext>) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const token = authHeader.split(" ")[1];

  try {
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
  } catch (err: any) {
    return c.json({ message: err.message }, 401);
  }
};

// ─── logout ───────────────────────────────────────────────────────────────────

export const logout = async (c: Context<AppContext>) => {
  const body = await c.req.json();
  const parsed = RefreshDto.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);

  try {
    const { drizzleClient, supabaseClient } = getCtxVars(c);
    await authService.logout({
      drizzleClient,
      supabaseClient,
      refreshToken: parsed.data.refreshToken,
    });
    return c.json({ message: "Logged out successfully" }, 200);
  } catch (err: any) {
    return c.json({ message: err.message }, 400);
  }
};
