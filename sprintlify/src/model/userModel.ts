// model/user.model.ts
import { eq } from "drizzle-orm";
import { users } from "../../drizzle/schema";
import { DrizzleClientType } from "../types/drizzleClientType";
import { SupabaseClientType } from "../types/supabaseClientType";

export const findUserByEmail = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  email: string;
}) => {
  const { drizzleClient, supabaseClient, email } = { ...params };
  const result = await drizzleClient
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result[0] ?? null;
};

export const findUserById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  userId: string;
}) => {
  const { drizzleClient, supabaseClient, userId } = { ...params };
  const result = await drizzleClient
    .select()
    .from(users)
    .where(eq(users.userId, userId))
    .limit(1);
  return result[0] ?? null;
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
  const { drizzleClient, supabaseClient, data } = { ...params };
  const result = await drizzleClient.insert(users).values(data).returning({
    userId: users.userId,
    email: users.email,
    username: users.username,
    securityLevel: users.securityLevel,
    createdAt: users.createdAt,
  });
  return result[0];
};
