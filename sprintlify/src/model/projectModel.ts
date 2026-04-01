import { eq } from "drizzle-orm";
import { projects, projectMembers } from "../../drizzle/schema";
import { DrizzleClientType } from "../types/drizzleClientType";
import { SupabaseClientType } from "../types/supabaseClientType";
import { dbQuery } from "../helper/dbQuery";
import { DatabaseError, NotFoundError } from "../error/AppError";

export const findProjectsByUserId = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  userId: string;
}) => {
  const { drizzleClient, userId } = { ...params };

  return await dbQuery(()=>drizzleClient
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
    .where(eq(projectMembers.userId, userId)));
};

export const findProjectById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
}) => {
  const { drizzleClient, projectId } = { ...params };
  const result = await dbQuery(()=>drizzleClient
    .select()
    .from(projects)
    .where(eq(projects.projectId, projectId)));

    if (!result[0]) throw new NotFoundError();
  return result[0];
};

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

  const result = await dbQuery(()=>drizzleClient.insert(projects).values(data).returning({
    projectId: projects.projectId,
    name: projects.name,
    description: projects.description,
    ownerId: projects.ownerId,
    createdAt: projects.createdAt,
  }));

  return result[0];
};

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

  const result = await dbQuery(()=>drizzleClient
    .update(projects)
    .set(data)
    .where(eq(projects.projectId, projectId))
    .returning({
      projectId: projects.projectId,
      name: projects.name,
      description: projects.description,
      ownerId: projects.ownerId,
      updatedAt: projects.updatedAt,
    }));

    if(!result[0]){
      throw new DatabaseError();
    }

  return result[0];
};

export const deleteProject = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
}) => {
  const { drizzleClient, projectId } = { ...params };

  await dbQuery(()=>drizzleClient.delete(projects).where(eq(projects.projectId, projectId)));
};
