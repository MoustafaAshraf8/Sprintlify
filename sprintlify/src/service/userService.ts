import { DrizzleClientType } from "../types/drizzleClientType";
import { SupabaseClientType } from "../types/supabaseClientType";
import { UpdateUserDtoType } from "../dto/userDto";
import { findAllUsers, findUserById, updateUser } from "../model/userModel";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { cacheKeys } from "../cache/cacheKeys";
import { cacheGet, cacheSet } from "../cache/kvCache";
import { KVNamespace } from "@cloudflare/workers-types";

// ─── get all ──────────────────────────────────────────────────────────────────

export const getAllUsers = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
}) => {
  const { drizzleClient, supabaseClient, kv } = { ...params };

  const cacheKey = cacheKeys.users();
  const cached = await cacheGet({ kv, key: cacheKey });
  if (cached) return cached;

  const allUsers = await findAllUsers({
    drizzleClient,
    supabaseClient,
  });

  await cacheSet({ kv, key: cacheKey, data: allUsers });

  return users;
};

// ─── get current user ─────────────────────────────────────────────────────────

export const getCurrentUser = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  userId: string;
}) => {
  const { drizzleClient, supabaseClient, kv, userId } = { ...params };

  const cacheKey = cacheKeys.user(userId);
  const cached = await cacheGet({ kv, key: cacheKey });
  if (cached) return cached;

  const user = await findUserById({
    drizzleClient,
    supabaseClient,
    userId,
  });
  if (!user) throw new Error("User not found");

  await cacheSet({ kv, key: cacheKey, data: user });

  return user;
};

// ─── update current user ──────────────────────────────────────────────────────

export const updateCurrentUser = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  userId: string;
  data: UpdateUserDtoType;
}) => {
  const { drizzleClient, supabaseClient, kv, userId, data } = { ...params };

  const user = await findUserById({
    drizzleClient,
    supabaseClient,
    userId,
  });
  if (!user) throw new Error("User not found");

  // check username is not taken if being updated
  if (data.username && data.username !== user.username) {
    const existing = await drizzleClient
      .select()
      .from(users)
      .where(eq(users.username, data.username))
      .limit(1);
    if (existing[0]) throw new Error("Username already taken");
  }

  const updatedUser = await updateUser({
    drizzleClient,
    supabaseClient,
    userId,
    data,
  });

  const updatedUsers = await findAllUsers({ drizzleClient, supabaseClient });

  cacheSet({ kv, key: cacheKeys.user(userId), data: updatedUser });
  cacheSet({ kv, key: cacheKeys.users(), data: updatedUsers });

  return updatedUser;
};
