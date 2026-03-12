import { and, eq } from "drizzle-orm";
import { projectMembers, users } from "../../drizzle/schema";
import { DrizzleClientType } from "../types/drizzleClientType";
import { SupabaseClientType } from "../types/supabaseClientType";
import { findProjectById } from "./projectModel";

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
  requesterId: string;
  userId: string;
}) => {
  const { drizzleClient, supabaseClient, projectId, requesterId, userId } = {
    ...params,
  };

  // verify project exists
  const project = await findProjectById({
    drizzleClient,
    supabaseClient,
    projectId,
  });
  if (!project) throw new Error("Project not found");

  // verify requester is the owner
  if (project.ownerId !== requesterId) throw new Error("Forbidden");

  // prevent owner from being removed
  if (userId === project.ownerId) {
    throw new Error("Owner cannot be removed from the project");
  }

  // prevent user from removing themselves  ← new check
  if (userId === requesterId) {
    throw new Error("You cannot remove yourself from the project");
  }

  // verify target user is actually a member
  const isMember = await findProjectMember({
    drizzleClient,
    supabaseClient,
    projectId,
    userId,
  });
  if (!isMember) throw new Error("User is not a member of this project");

  await drizzleClient
    .delete(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId),
      ),
    );
};
