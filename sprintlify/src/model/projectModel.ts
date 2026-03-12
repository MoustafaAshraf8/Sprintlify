import { eq } from "drizzle-orm";
import { projects, projectMembers } from "../../drizzle/schema";
import { DrizzleClientType } from "../types/drizzleClientType";
import { SupabaseClientType } from "../types/supabaseClientType";

// ─── find all by user ─────────────────────────────────────────────────────────

export const findProjectsByUserId = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  userId: string;
}) => {
  const { drizzleClient, userId } = { ...params };

  return await drizzleClient
    .select({
      projectId: projects.projectId,
      name: projects.name,
      description: projects.description,
      ownerId: projects.ownerId,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
    })
    .from(projects)
    .innerJoin(projectMembers, eq(projects.projectId, projectMembers.projectId))
    .where(eq(projectMembers.userId, userId));
};

// ─── find by id ───────────────────────────────────────────────────────────────

export const findProjectById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
}) => {
  const { drizzleClient, projectId } = { ...params };

  const result = await drizzleClient
    .select()
    .from(projects)
    .where(eq(projects.projectId, projectId))
    .limit(1);

  return result[0] ?? null;
};

// ─── insert ───────────────────────────────────────────────────────────────────

export const insertProject = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  data: {
    name: string;
    description?: string;
    ownerId: string;
  };
}) => {
  const { drizzleClient, data } = { ...params };

  const result = await drizzleClient.insert(projects).values(data).returning({
    projectId: projects.projectId,
    name: projects.name,
    description: projects.description,
    ownerId: projects.ownerId,
    createdAt: projects.createdAt,
  });

  return result[0];
};

// ─── update ───────────────────────────────────────────────────────────────────

export const updateProject = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
  data: {
    name?: string;
    description?: string;
  };
}) => {
  const { drizzleClient, projectId, data } = { ...params };

  const result = await drizzleClient
    .update(projects)
    .set(data)
    .where(eq(projects.projectId, projectId))
    .returning({
      projectId: projects.projectId,
      name: projects.name,
      description: projects.description,
      ownerId: projects.ownerId,
      updatedAt: projects.updatedAt,
    });

  return result[0] ?? null;
};

// ─── delete ───────────────────────────────────────────────────────────────────

export const deleteProject = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
}) => {
  const { drizzleClient, projectId } = { ...params };

  await drizzleClient.delete(projects).where(eq(projects.projectId, projectId));
};
