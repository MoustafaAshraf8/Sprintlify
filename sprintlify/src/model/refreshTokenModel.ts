import { eq, and } from "drizzle-orm";
import { refreshTokens } from "../../drizzle/schema";
import { DrizzleClientType } from "../types/drizzleClientType";
import { SupabaseClientType } from "../types/supabaseClientType";

export const findRefreshToken = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  token: string;
}) => {
  const { drizzleClient, token } = { ...params };

  const result = await drizzleClient
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, token))
    .limit(1);

  return result[0] ?? null;
};

export const insertRefreshToken = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  data: {
    userId: string;
    token: string;
    expiresAt: string;
  };
}) => {
  const { drizzleClient, data } = { ...params };

  const result = await drizzleClient
    .insert(refreshTokens)
    .values(data)
    .returning({
      id: refreshTokens.id,
      userId: refreshTokens.userId,
      expiresAt: refreshTokens.expiresAt,
      createdAt: refreshTokens.createdAt,
    });

  return result[0];
};

export const deleteRefreshToken = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  token: string;
}) => {
  const { drizzleClient, token } = { ...params };

  await drizzleClient
    .delete(refreshTokens)
    .where(eq(refreshTokens.token, token));
};

export const deleteAllUserRefreshTokens = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  userId: string;
}) => {
  const { drizzleClient, userId } = { ...params };

  await drizzleClient
    .delete(refreshTokens)
    .where(eq(refreshTokens.userId, userId));
};
