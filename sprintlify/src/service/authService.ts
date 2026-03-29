// service/authService.ts
import bcrypt from "bcryptjs";
import { DrizzleClientType } from "../types/drizzleClientType";
import { SupabaseClientType } from "../types/supabaseClientType";
import { findUserByEmail, findUserById, insertUser } from "../model/userModel";
import {
  findRefreshToken,
  insertRefreshToken,
  deleteRefreshToken,
  deleteAllUserRefreshTokens,
} from "../model/refreshTokenModel";
import { RegisterDtoType, LoginDtoType, RefreshDtoType } from "../dto/authDto";
import { ForbiddenError, ValidationError } from "../error/AppError";
import {generateTokens, verifyToken} from "../helper/tokenOperations";


const refreshTokenExpiresAt = () =>
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

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

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await insertUser({
    drizzleClient,
    supabaseClient,
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
    jwtSecret,
    jwtRefreshSecret,
  });

  await insertRefreshToken({
    drizzleClient,
    supabaseClient,
    data: {
      userId: user.userId,
      token: tokens.refreshToken,
      expiresAt: refreshTokenExpiresAt(),
    },
  });

  return { user, ...tokens };
};

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
    drizzleClient,
    supabaseClient,
    email: data.email,
  });

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) throw new ValidationError();

  const tokens = await generateTokens({
    userId: user.userId,
    securityLevel: user.securityLevel!,
    jwtSecret,
    jwtRefreshSecret,
  });

  await insertRefreshToken({
    drizzleClient,
    supabaseClient,
    data: {
      userId: user.userId,
      token: tokens.refreshToken,
      expiresAt: refreshTokenExpiresAt(),
    },
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

  // 1. verify JWT signature
  let payload: any;
  try {
    payload = await verifyToken({token:data.refreshToken, jwtSecret:jwtRefreshSecret});
  } catch {
    throw new ValidationError();
  }

  // 2. check token exists in DB
  const storedToken = await findRefreshToken({
    drizzleClient,
    supabaseClient,
    token: data.refreshToken,
  });

  if (!storedToken) {
    // reuse detected → nuke all tokens for this user
    await deleteAllUserRefreshTokens({
      drizzleClient,
      supabaseClient,
      userId: payload.id,
    });
    throw new ForbiddenError();
  }

  // 3. delete used token (rotation)
  await deleteRefreshToken({
    drizzleClient,
    supabaseClient,
    token: data.refreshToken,
  });

  // 4. generate new tokens
  const tokens = await generateTokens({
    userId: payload.id,
    securityLevel: payload.securityLevel,
    jwtSecret,
    jwtRefreshSecret,
  });

  // 5. save new refresh token to DB
  await insertRefreshToken({
    drizzleClient,
    supabaseClient,
    data: {
      userId: payload.id,
      token: tokens.refreshToken,
      expiresAt: refreshTokenExpiresAt(),
    },
  });

  return tokens;
};

export const authenticate = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  jwtSecret: string;
  jwtRefreshSecret: string;
  token: string;
}) => {
  const { drizzleClient, supabaseClient, jwtSecret, token } = { ...params };

  let payload: any;
  try {
    payload = await verifyToken({token:token, jwtSecret:jwtSecret});
  } catch {
    throw new ValidationError();
  }

  const user = await findUserById({
    drizzleClient,
    supabaseClient,
    userId: payload.id,
  });

  return {
    userId: user.userId,
    email: user.email,
    username: user.username,
    securityLevel: user.securityLevel,
  };
};

export const logout = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  refreshToken: string;
}) => {
  const { drizzleClient, supabaseClient, refreshToken } = { ...params };

  await deleteRefreshToken({
    drizzleClient,
    supabaseClient,
    token: refreshToken,
  });
};
