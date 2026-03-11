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

// ─── get members ──────────────────────────────────────────────────────────────

export const getProjectMembers = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
  requesterId: string;
}) => {
  const { drizzleClient, supabaseClient, projectId, requesterId } = {
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
    userId: requesterId,
  });
  if (!isMember) throw new Error("Forbidden");

  return await findProjectMembers({
    drizzleClient,
    supabaseClient,
    projectId,
  });
};

// ─── add member ───────────────────────────────────────────────────────────────

export const addProjectMember = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
  requesterId: string;
  data: AddMemberDtoType;
}) => {
  const { drizzleClient, supabaseClient, projectId, requesterId, data } = {
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

  // verify user to add exists
  const userToAdd = await findUserById({
    drizzleClient,
    supabaseClient,
    userId: data.userId,
  });
  if (!userToAdd) throw new Error("User not found");

  // verify user is not already a member
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

  return await insertProjectMember({
    drizzleClient,
    supabaseClient,
    data: {
      projectId,
      userId: data.userId,
      project_security_level: "member",
    },
  });
};

// ─── remove member ────────────────────────────────────────────────────────────

export const removeProjectMember = async (params: {
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

  // prevent owner from removing themselves
  if (userId === project.ownerId) {
    throw new Error("Owner cannot be removed from the project");
  }

  // verify user is actually a member
  const isMember = await findProjectMember({
    drizzleClient,
    supabaseClient,
    projectId,
    userId,
  });
  if (!isMember) throw new Error("User is not a member of this project");

  await deleteProjectMember({
    drizzleClient,
    supabaseClient,
    projectId,
    requesterId,
    userId,
  });
};
