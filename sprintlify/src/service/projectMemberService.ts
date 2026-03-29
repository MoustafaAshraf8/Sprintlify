import { DrizzleClientType } from "../types/drizzleClientType";
import { SupabaseClientType } from "../types/supabaseClientType";
import { AddMemberDtoType } from "../dto/projectMemberDto";
import {
  findProjectMember,
  findProjectMembers,
  insertProjectMember,
  deleteProjectMember,
} from "../model/projectMemberModel";
import { findProjectById } from "../model/projectModel";
import { findUserById } from "../model/userModel";
import { cacheKeys } from "../cache/cacheKeys";
import { cacheDel, cacheGet, cacheSet } from "../cache/kvCache";
import { KVNamespace } from "@cloudflare/workers-types";
import { ForbiddenError } from "../error/AppError";

export const getProjectMembers = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  userId: string;
}) => {
  const { drizzleClient, supabaseClient, kv, projectId, userId } = {
    ...params,
  };

  await findProjectMember({
    drizzleClient,
    supabaseClient,
    projectId,
    userId: userId,
  });

  const cacheKey = cacheKeys.project_members(projectId);
  const cached = await cacheGet({ kv, key: cacheKey });
  if (cached) return cached;

  const projectMembers = await findProjectMembers({
    drizzleClient,
    supabaseClient,
    projectId,
  });

  await cacheSet({ kv, key: cacheKey, data: projectMembers });

  return projectMembers;
};

export const addProjectMember = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  userId: string;
  data: AddMemberDtoType;
}) => {
  const { drizzleClient, supabaseClient, kv, projectId, userId, data } = {
    ...params,
  };

  const project = await findProjectById({
    drizzleClient,
    supabaseClient,
    projectId,
  });

  if (project.ownerId !== userId) throw new ForbiddenError();

  await insertProjectMember({
    drizzleClient,
    supabaseClient,
    data: {
      projectId,
      userId: data.userId,
      project_security_level: "member",
    },
  });

  const updatedMembers = await findProjectMembers({
    drizzleClient,
    supabaseClient,
    projectId,
  });

  await cacheSet({
    kv,
    key: cacheKeys.project_members(projectId),
    data: updatedMembers,
  });
  await cacheDel({ kv, key: cacheKeys.user_projects(data.userId) });

  return;
};

export const removeProjectMember = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  unwantedId: string;
  userId: string;
}) => {
  const { drizzleClient, supabaseClient, kv, projectId, unwantedId, userId } = {
    ...params,
  };

  await deleteProjectMember({
    drizzleClient,
    supabaseClient,
    projectId,
    unwantedId,
    userId,
  });

  const updatedMembers = await findProjectMembers({
    drizzleClient,
    supabaseClient,
    projectId,
  });

  await cacheSet({
    kv,
    key: cacheKeys.project_members(projectId),
    data: updatedMembers,
  });
  await cacheDel({ kv, key: cacheKeys.user_projects(userId) });

  return;
};
