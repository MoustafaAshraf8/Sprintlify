import { and, eq } from "drizzle-orm";
import { projectMembers, users } from "../../drizzle/schema";
import { DrizzleClientType } from "../types/drizzleClientType";
import { SupabaseClientType } from "../types/supabaseClientType";

// ─── find member ──────────────────────────────────────────────────────────────

export const findProjectMember = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
  userId: string;
}) => {
  const { drizzleClient, projectId, userId } = { ...params };

  const result = await drizzleClient
    .select()
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId),
      ),
    )
    .limit(1);

  return result[0] ?? null;
};

// ─── find all members ─────────────────────────────────────────────────────────

export const findProjectMembers = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
}) => {
  const { drizzleClient, projectId } = { ...params };

  return await drizzleClient
    .select({
      userId: users.userId,
      username: users.username,
      email: users.email,
      project_security_level: projectMembers.projectSecurityLevel,
      joinedAt: projectMembers.joinedAt,
    })
    .from(projectMembers)
    .innerJoin(users, eq(projectMembers.userId, users.userId))
    .where(eq(projectMembers.projectId, projectId));
};

// ─── insert member ────────────────────────────────────────────────────────────

export const insertProjectMember = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  data: {
    projectId: string;
    userId: string;
    project_security_level: "owner" | "member";
  };
}) => {
  const { drizzleClient, data } = { ...params };

  const result = await drizzleClient
    .insert(projectMembers)
    .values(data)
    .returning();

  return result[0];
};

// ─── delete member ────────────────────────────────────────────────────────────

export const deleteProjectMember = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
  userId: string;
}) => {
  const { drizzleClient, projectId, userId } = { ...params };

  await drizzleClient
    .delete(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId),
      ),
    );
};
