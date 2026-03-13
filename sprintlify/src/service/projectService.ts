import { DrizzleClientType } from "../types/drizzleClientType";
import { SupabaseClientType } from "../types/supabaseClientType";
import { CreateProjectDtoType, UpdateProjectDtoType } from "../dto/projectDto";
import {
  findProjectsByUserId,
  findProjectById,
  insertProject,
  updateProject,
  deleteProject,
} from "../model/projectModel";
import {
  insertProjectMember,
  findProjectMember,
} from "../model/projectMemberModel";
import { cacheKeys } from "../cache/cacheKeys";
import { cacheDel, cacheGet, cacheSet } from "../cache/kvCache";
import { KVNamespace } from "@cloudflare/workers-types";

// ─── get all ──────────────────────────────────────────────────────────────────

export const getProjects = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  userId: string;
}) => {
  const { drizzleClient, supabaseClient, kv, userId } = { ...params };

  const cacheKey = cacheKeys.user_projects(userId);
  const cached = await cacheGet({ kv, key: cacheKey });
  if (cached) return cached;

  const data = await findProjectsByUserId({
    drizzleClient,
    supabaseClient,
    userId,
  });

  await cacheSet({ kv, key: cacheKey, data });

  return data;
};

// ─── get by id ────────────────────────────────────────────────────────────────

export const getProjectById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  userId: string;
}) => {
  const { drizzleClient, supabaseClient, kv, projectId, userId } = {
    ...params,
  };

  const cacheKey = cacheKeys.project(projectId);
  const cached = await cacheGet({ kv, key: cacheKey });
  if (cached) return cached;

  const project = await findProjectById({
    drizzleClient,
    supabaseClient,
    projectId,
  });
  if (!project) throw new Error("Project not found");

  // verify user is a member
  const isMember = await findProjectMember({
    drizzleClient,
    supabaseClient,
    projectId,
    userId,
  });
  if (!isMember) throw new Error("Forbidden");

  await cacheSet({ kv, key: cacheKey, data: project });

  return project;
};

// ─── create ───────────────────────────────────────────────────────────────────

export const createProject = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  userId: string;
  data: CreateProjectDtoType;
}) => {
  const { drizzleClient, supabaseClient, kv, userId, data } = { ...params };

  const project = await insertProject({
    drizzleClient,
    supabaseClient,
    data: {
      name: data.name,
      description: data.description,
      ownerId: userId,
    },
  });

  await insertProjectMember({
    drizzleClient,
    supabaseClient,
    data: {
      projectId: project.projectId,
      userId: userId,
      project_security_level: "owner",
    },
  });

  const updatedProjects = await findProjectsByUserId({
    drizzleClient,
    supabaseClient,
    userId: userId,
  });

  cacheSet({ kv, key: cacheKeys.project(project.projectId), data: project });
  cacheSet({ kv, key: cacheKeys.user_projects(userId), data: updatedProjects });

  return project;
};

// ─── update ───────────────────────────────────────────────────────────────────

export const updateProjectById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  userId: string;
  data: UpdateProjectDtoType;
}) => {
  const { drizzleClient, supabaseClient, kv, projectId, userId, data } = {
    ...params,
  };

  const project = await findProjectById({
    drizzleClient,
    supabaseClient,
    projectId,
  });
  if (!project) throw new Error("Project not found");

  if (project.ownerId !== userId) throw new Error("Forbidden");

  const updatedProject = await updateProject({
    drizzleClient,
    supabaseClient,
    projectId,
    data,
  });

  const updatedProjects = await findProjectsByUserId({
    drizzleClient,
    supabaseClient,
    userId: userId,
  });

  await cacheSet({
    kv,
    key: cacheKeys.project(projectId),
    data: updatedProject,
  });
  await cacheSet({
    kv,
    key: cacheKeys.user_projects(userId),
    data: updatedProjects,
  });

  return updatedProject;
};

// ─── delete ───────────────────────────────────────────────────────────────────

export const deleteProjectById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  userId: string;
}) => {
  const { drizzleClient, supabaseClient, kv, projectId, userId } = {
    ...params,
  };

  const project = await findProjectById({
    drizzleClient,
    supabaseClient,
    projectId,
  });
  if (!project) throw new Error("Project not found");

  if (project.ownerId !== userId) throw new Error("Forbidden");

  await deleteProject({
    drizzleClient,
    supabaseClient,
    projectId,
  });

  const updatedProjects = await findProjectsByUserId({
    drizzleClient,
    supabaseClient,
    userId: userId,
  });

  await cacheDel({ kv, key: cacheKeys.project(projectId) });
  await cacheDel({ kv, key: cacheKeys.project_members(projectId) });
  await cacheDel({ kv, key: cacheKeys.project_tickets(projectId) });
  await cacheSet({
    kv,
    key: cacheKeys.user_projects(userId),
    data: updatedProjects,
  });

  return;
};
