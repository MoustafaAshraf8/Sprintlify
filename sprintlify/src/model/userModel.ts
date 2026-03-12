// model/userModel.ts
import { eq } from "drizzle-orm";
import { users } from "../../drizzle/schema";
import { DrizzleClientType } from "../types/drizzleClientType";
import { SupabaseClientType } from "../types/supabaseClientType";
import { UpdateUserDtoType } from "../dto/userDto";

// ─── find all ─────────────────────────────────────────────────────────────────

export const findAllUsers = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
}) => {
  const { drizzleClient } = { ...params };

  return await drizzleClient
    .select({
      userId: users.userId,
      email: users.email,
      username: users.username,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
      nickname: users.nickname,
      securityLevel: users.securityLevel,
      createdAt: users.createdAt,
    })
    .from(users);
};

// ─── find by id ───────────────────────────────────────────────────────────────

export const findUserById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  userId: string;
}) => {
  const { drizzleClient, userId } = { ...params };

  const result = await drizzleClient
    .select({
      userId: users.userId,
      email: users.email,
      username: users.username,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
      nickname: users.nickname,
      securityLevel: users.securityLevel,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.userId, userId))
    .limit(1);

  return result[0] ?? null;
};

// ─── find by email ────────────────────────────────────────────────────────────

export const findUserByEmail = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  email: string;
}) => {
  const { drizzleClient, email } = { ...params };

  const result = await drizzleClient
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result[0] ?? null;
};

// ─── insert ───────────────────────────────────────────────────────────────────

export const insertUser = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  data: {
    email: string;
    username: string;
    passwordHash: string;
    securityLevel: "admin" | "member";
  };
}) => {
  const { drizzleClient, data } = { ...params };

  const result = await drizzleClient.insert(users).values(data).returning({
    userId: users.userId,
    email: users.email,
    username: users.username,
    securityLevel: users.securityLevel,
    createdAt: users.createdAt,
  });

  return result[0];
};

// ─── update ───────────────────────────────────────────────────────────────────

export const updateUser = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  userId: string;
  data: UpdateUserDtoType;
}) => {
  const { drizzleClient, userId, data } = { ...params };

  const result = await drizzleClient
    .update(users)
    .set(data)
    .where(eq(users.userId, userId))
    .returning({
      userId: users.userId,
      email: users.email,
      username: users.username,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
      nickname: users.nickname,
      updatedAt: users.updatedAt,
    });

  return result[0] ?? null;
};
