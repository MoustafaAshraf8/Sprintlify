import { Context } from "hono";
import { AppContext } from "../types/AppContext";
import { CreateProjectDto, UpdateProjectDto } from "../dto/projectDto";
import * as projectService from "../service/projectService";
import { getCtxVars } from "../helper/getCtxVars";
import { getCtxBind } from "../helper/getCtxBind";

export const getProjects = async (c: Context<AppContext>) => {
    const { drizzleClient, supabaseClient, user } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    const projects = await projectService.getProjects({
      drizzleClient,
      supabaseClient,
      kv,
      userId:user.id,
    });
    return c.json(projects, 200);

};

export const getProjectById = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");

    const { drizzleClient, supabaseClient, user } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    const project = await projectService.getProjectById({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      userId:user.id,
    });
    return c.json(project, 200);
};

export const createProject = async (c: Context<AppContext>) => {
  const body = await c.req.json();
  const parsed = CreateProjectDto.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);

    const { drizzleClient, supabaseClient, user } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    const project = await projectService.createProject({
      drizzleClient,
      supabaseClient,
      kv,
      userId:user.id,
      data: parsed.data,
    });
    return c.json(project, 201);
};

export const updateProject = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const body = await c.req.json();
  const parsed = UpdateProjectDto.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);

    const { drizzleClient, supabaseClient, user } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    const project = await projectService.updateProjectById({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      userId:user.id,
      data: parsed.data,
    });
    return c.json(project, 200);
};

export const deleteProject = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");

    const { drizzleClient, supabaseClient, user } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    await projectService.deleteProjectById({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      userId:user.id,
    });
    return c.json({ message: "Project deleted" }, 200);
};
