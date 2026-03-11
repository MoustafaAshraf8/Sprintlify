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

// ─── get all ──────────────────────────────────────────────────────────────────

export const getProjects = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  userId: string;
}) => {
  const { drizzleClient, supabaseClient, userId } = { ...params };

  return await findProjectsByUserId({
    drizzleClient,
    supabaseClient,
    userId,
  });
};

// ─── get by id ────────────────────────────────────────────────────────────────

export const getProjectById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
  userId: string;
}) => {
  const { drizzleClient, supabaseClient, projectId, userId } = { ...params };

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

  return project;
};

// ─── create ───────────────────────────────────────────────────────────────────

export const createProject = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  userId: string;
  data: CreateProjectDtoType;
}) => {
  const { drizzleClient, supabaseClient, userId, data } = { ...params };

  // create the project
  const project = await insertProject({
    drizzleClient,
    supabaseClient,
    data: {
      name: data.name,
      description: data.description,
      ownerId: userId,
    },
  });

  // auto-add creator as owner in project_members
  await insertProjectMember({
    drizzleClient,
    supabaseClient,
    data: {
      projectId: project.projectId,
      userId: userId,
      project_security_level: "owner",
    },
  });

  return project;
};

// ─── update ───────────────────────────────────────────────────────────────────

export const updateProjectById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
  userId: string;
  data: UpdateProjectDtoType;
}) => {
  const { drizzleClient, supabaseClient, projectId, userId, data } = {
    ...params,
  };

  // verify project exists
  const project = await findProjectById({
    drizzleClient,
    supabaseClient,
    projectId,
  });
  if (!project) throw new Error("Project not found");

  // verify user is owner
  if (project.ownerId !== userId) throw new Error("Forbidden");

  return await updateProject({
    drizzleClient,
    supabaseClient,
    projectId,
    data,
  });
};

// ─── delete ───────────────────────────────────────────────────────────────────

export const deleteProjectById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
  userId: string;
}) => {
  const { drizzleClient, supabaseClient, projectId, userId } = { ...params };

  // verify project exists
  const project = await findProjectById({
    drizzleClient,
    supabaseClient,
    projectId,
  });
  if (!project) throw new Error("Project not found");

  // verify user is owner
  if (project.ownerId !== userId) throw new Error("Forbidden");

  await deleteProject({
    drizzleClient,
    supabaseClient,
    projectId,
  });
};
