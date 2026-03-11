// model/projectMemberModel.ts
import { and, eq } from "drizzle-orm";
import { projectMembers } from "../../drizzle/schema";
import { DrizzleClientType } from "../types/drizzleClientType";
import { SupabaseClientType } from "../types/supabaseClientType";

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

export const insertProjectMember = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  data: {
    projectId: string;
    userId: string;
    role: "owner" | "member";
  };
}) => {
  const { drizzleClient, data } = { ...params };

  const result = await drizzleClient
    .insert(projectMembers)
    .values(data)
    .returning();

  return result[0];
};
