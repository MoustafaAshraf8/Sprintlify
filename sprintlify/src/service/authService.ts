import bcrypt from "bcryptjs";
import { sign, verify } from "hono/jwt";
import { DrizzleClientType } from "../types/drizzleClientType";
import { findUserByEmail, findUserById, insertUser } from "../model/userModel";
import { RegisterDtoType, LoginDtoType, RefreshDtoType } from "../dto/authDto";
import { SupabaseClientType } from "../types/supabaseClientType";

// ─── token helpers ────────────────────────────────────────────────────────────

const generateTokens = async (params: {
  userId: string;
  securityLevel: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
}) => {
  const { userId, securityLevel, jwtSecret, jwtRefreshSecret } = { ...params };
  const accessToken = await sign(
    {
      id: userId,
      securityLevel,
      exp: Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes
    },
    jwtSecret,
  );

  const refreshToken = await sign(
    {
      id: userId,
      securityLevel,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    },
    jwtRefreshSecret,
  );

  return { accessToken, refreshToken };
};

// ─── register ─────────────────────────────────────────────────────────────────

export const register = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  jwtSecret: string;
  jwtRefreshSecret: string;
  data: RegisterDtoType;
}) => {
  const { drizzleClient, supabaseClient, jwtSecret, jwtRefreshSecret, data } = {
    ...params,
  };
  const existing = await findUserByEmail({
    drizzleClient: drizzleClient,
    supabaseClient: supabaseClient,
    email: data.email,
  });
  if (existing) throw new Error("Email already in use");

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await insertUser({
    drizzleClient: drizzleClient,
    supabaseClient: supabaseClient,
    data: {
      email: data.email,
      username: data.username,
      passwordHash,
      securityLevel: "member",
    },
  });

  const tokens = await generateTokens({
    userId: user.userId,
    securityLevel: user.securityLevel!,
    jwtSecret: jwtSecret,
    jwtRefreshSecret: jwtRefreshSecret,
  });

  return { user, ...tokens };
};

// ─── login ────────────────────────────────────────────────────────────────────

export const login = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  jwtSecret: string;
  jwtRefreshSecret: string;
  data: LoginDtoType;
}) => {
  const { drizzleClient, supabaseClient, jwtSecret, jwtRefreshSecret, data } = {
    ...params,
  };
  const user = await findUserByEmail({
    drizzleClient: drizzleClient,
    supabaseClient: supabaseClient,
    email: data.email,
  });
  if (!user) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) throw new Error("Invalid credentials");

  const tokens = await generateTokens({
    userId: user.userId,
    securityLevel: user.securityLevel!,
    jwtSecret: jwtSecret,
    jwtRefreshSecret: jwtRefreshSecret,
  });

  return {
    user: {
      userId: user.userId,
      email: user.email,
      username: user.username,
      securityLevel: user.securityLevel,
    },
    ...tokens,
  };
};

// ─── refresh ──────────────────────────────────────────────────────────────────

export const refresh = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  jwtSecret: string;
  jwtRefreshSecret: string;
  data: RefreshDtoType;
}) => {
  const { drizzleClient, supabaseClient, jwtSecret, jwtRefreshSecret, data } = {
    ...params,
  };
  let payload: any;

  try {
    payload = await verify(data.refreshToken, jwtRefreshSecret, "HS256");
  } catch {
    throw new Error("Invalid or expired refresh token");
  }

  const user = await findUserById({
    drizzleClient: drizzleClient,
    supabaseClient: supabaseClient,
    userId: payload.id,
  });
  if (!user) throw new Error("User not found");

  const tokens = await generateTokens({
    userId: user.userId,
    securityLevel: user.securityLevel!,
    jwtSecret: jwtSecret,
    jwtRefreshSecret: jwtRefreshSecret,
  });

  return tokens;
};

// ─── authenticate ─────────────────────────────────────────────────────────────

export const authenticate = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  jwtSecret: string;
  jwtRefreshSecret: string;
  token: string;
}) => {
  const { drizzleClient, supabaseClient, jwtSecret, jwtRefreshSecret, token } =
    {
      ...params,
    };
  let payload: any;

  try {
    payload = await verify(token, jwtSecret, "HS256");
  } catch {
    throw new Error("Invalid or expired token");
  }

  const user = await findUserById({
    drizzleClient: drizzleClient,
    supabaseClient: supabaseClient,
    userId: payload.id,
  });
  if (!user) throw new Error("User not found");

  return {
    userId: user.userId,
    email: user.email,
    username: user.username,
    securityLevel: user.securityLevel,
  };
};
