import { DrizzleClientType } from "../types/drizzleClientType";
import { SupabaseClientType } from "../types/supabaseClientType";
import { UpdateUserDtoType } from "../dto/userDto";
import { findAllUsers, findUserById, updateUser } from "../model/userModel";
import { users } from "../../drizzle/schema";
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
