// service/projectMemberService.ts
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

// ─── get members ──────────────────────────────────────────────────────────────

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

  // verify project exists
  const project = await findProjectById({
    drizzleClient,
    supabaseClient,
    projectId,
  });
  if (!project) throw new Error("Project not found");

  // verify requester is a member
  const isMember = await findProjectMember({
    drizzleClient,
    supabaseClient,
    projectId,
    userId: userId,
  });
  if (!isMember) throw new Error("Forbidden");

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

// ─── add member ───────────────────────────────────────────────────────────────

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

  // verify project exists
  const project = await findProjectById({
    drizzleClient,
    supabaseClient,
    projectId,
  });
  if (!project) throw new Error("Project not found");

  // verify current_user is the owner
  if (project.ownerId !== userId) throw new Error("Forbidden");

  // verify new_user to add exists
  const userToAdd = await findUserById({
    drizzleClient,
    supabaseClient,
    userId: data.userId,
  });
  if (!userToAdd) throw new Error("User not found");

  // verify new_user is not already a member
  const alreadyMember = await findProjectMember({
    drizzleClient,
    supabaseClient,
    projectId,
    userId: data.userId,
  });
  if (alreadyMember) throw new Error("User is already a member");

  // prevent adding owner again
  if (data.userId === project.ownerId) {
    throw new Error("Owner is already a member of the project");
  }

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

// ─── remove member ────────────────────────────────────────────────────────────

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

  // verify project exists
  const project = await findProjectById({
    drizzleClient,
    supabaseClient,
    projectId,
  });
  if (!project) throw new Error("Project not found");

  // verify current_user is the owner
  if (project.ownerId !== userId) throw new Error("Forbidden");

  // prevent owner from removing themselves
  if (userId === project.ownerId) {
    throw new Error("Owner cannot be removed from the project");
  }

  // verify unwanted_user is actually a member
  const isMember = await findProjectMember({
    drizzleClient,
    supabaseClient,
    projectId,
    userId: unwantedId,
  });
  if (!isMember) throw new Error("User is not a member of this project");

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
