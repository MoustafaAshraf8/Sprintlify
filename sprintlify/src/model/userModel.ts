import { eq } from "drizzle-orm";
import { users } from "../../drizzle/schema";
import { DrizzleClientType } from "../types/drizzleClientType";
import { SupabaseClientType } from "../types/supabaseClientType";
import { UpdateUserDtoType } from "../dto/userDto";
import { dbQuery } from "../helper/dbQuery";
import { NotFoundError } from "../error/AppError";

export const findAllUsers = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
}) => {
  const { drizzleClient } = { ...params };

  const result = await dbQuery(() =>
    drizzleClient
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
      .from(users),
  );

  return result;
};

export const findUserById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  userId: string;
}) => {
  const { drizzleClient, userId } = { ...params };

  const result = await dbQuery(() =>
    drizzleClient
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
      .limit(1),
  );

  if (!result[0]) throw new NotFoundError();

  return result[0];
};

export const findUserByEmail = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  email: string;
}) => {
  const { drizzleClient, email } = { ...params };

  const result = await dbQuery(() =>
    drizzleClient.select().from(users).where(eq(users.email, email)).limit(1),
  );

  if (!result[0]) throw new NotFoundError();

  return result[0];
};

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

  const result = await dbQuery(() =>
    drizzleClient.insert(users).values(data).returning({
      userId: users.userId,
      email: users.email,
      username: users.username,
      securityLevel: users.securityLevel,
      createdAt: users.createdAt,
    }),
  );

  return result[0];
};

export const updateUser = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  userId: string;
  data: UpdateUserDtoType;
}) => {
  const { drizzleClient, userId, data } = { ...params };

  const result = await dbQuery(() =>
    drizzleClient
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
      }),
  );

  if (!result[0]) throw new NotFoundError();

  return result[0];
};
