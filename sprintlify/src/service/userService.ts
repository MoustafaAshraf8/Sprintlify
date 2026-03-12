import { DrizzleClientType } from "../types/drizzleClientType";
import { SupabaseClientType } from "../types/supabaseClientType";
import { UpdateUserDtoType } from "../dto/userDto";
import { findAllUsers, findUserById, updateUser } from "../model/userModel";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// ─── get all ──────────────────────────────────────────────────────────────────

export const getAllUsers = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
}) => {
  const { drizzleClient, supabaseClient } = { ...params };

  return await findAllUsers({
    drizzleClient,
    supabaseClient,
  });
};

// ─── get current user ─────────────────────────────────────────────────────────

export const getCurrentUser = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  userId: string;
}) => {
  const { drizzleClient, supabaseClient, userId } = { ...params };

  const user = await findUserById({
    drizzleClient,
    supabaseClient,
    userId,
  });
  if (!user) throw new Error("User not found");

  return user;
};

// ─── update current user ──────────────────────────────────────────────────────

export const updateCurrentUser = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  userId: string;
  data: UpdateUserDtoType;
}) => {
  const { drizzleClient, supabaseClient, userId, data } = { ...params };

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

  return await updateUser({
    drizzleClient,
    supabaseClient,
    userId,
    data,
  });
};
