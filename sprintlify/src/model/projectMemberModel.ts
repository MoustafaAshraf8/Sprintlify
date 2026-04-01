import { and, eq, ne } from "drizzle-orm";
import { projectMembers, users } from "../../drizzle/schema";
import { DrizzleClientType } from "../types/drizzleClientType";
import { SupabaseClientType } from "../types/supabaseClientType";
import { dbQuery } from "../helper/dbQuery";
import { NotFoundError } from "../error/AppError";
import { DatabaseError } from "../error/AppError";

export const findProjectMember = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
  userId: string;
}) => {
  const { drizzleClient, projectId, userId } = { ...params };

  const result = await dbQuery(()=>drizzleClient
    .select()
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId),
      ),
    ));

    if(!result[0]) throw new NotFoundError();

  return result[0];
};

export const findProjectMembers = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
}) => {
  const { drizzleClient, projectId } = { ...params };

  return await dbQuery(()=>drizzleClient
    .select({
      userId: users.userId,
      username: users.username,
      email: users.email,
      project_security_level: projectMembers.projectSecurityLevel,
      joinedAt: projectMembers.joinedAt,
    })
    .from(projectMembers)
    .innerJoin(users, eq(projectMembers.userId, users.userId))
    .where(eq(projectMembers.projectId, projectId)));
};

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

  const result = await dbQuery(()=>drizzleClient
    .insert(projectMembers)
    .values(data)
    .returning());

    if(!result[0]) throw new DatabaseError();

  return result[0];
};

export const deleteProjectMember = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
  unwantedId: string;
  userId: string;
}) => {
  const { drizzleClient, supabaseClient, projectId, unwantedId, userId } = {
    ...params,
  };

  const res = await dbQuery(()=>drizzleClient
    .delete(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, unwantedId),
        ne(projectMembers.userId, userId)
      ),
    ).returning());

    if(!res[0]) throw new DatabaseError();
    
    return;

};
