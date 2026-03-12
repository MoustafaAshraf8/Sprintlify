// controller/projectController.ts
import { Context } from "hono";
import { AppContext } from "../types/AppContext";
import { CreateProjectDto, UpdateProjectDto } from "../dto/projectDto";
import * as projectService from "../service/projectService";

const getCtxVars = (c: Context<AppContext>) => ({
  drizzleClient: c.get("drizzleClient"),
  supabaseClient: c.get("supabaseClient"),
  userId: c.get("user").id,
});

// ─── get all ──────────────────────────────────────────────────────────────────

export const getProjects = async (c: Context<AppContext>) => {
  try {
    const { drizzleClient, supabaseClient, userId } = getCtxVars(c);
    const projects = await projectService.getProjects({
      drizzleClient,
      supabaseClient,
      userId,
    });
    return c.json(projects, 200);
  } catch (err: any) {
    return c.json({ message: err.message }, 400);
  }
};

// ─── get by id ────────────────────────────────────────────────────────────────

export const getProjectById = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");

  try {
    const { drizzleClient, supabaseClient, userId } = getCtxVars(c);
    const project = await projectService.getProjectById({
      drizzleClient,
      supabaseClient,
      projectId,
      userId,
    });
    return c.json(project, 200);
  } catch (err: any) {
    const status =
      err.message === "Forbidden"
        ? 403
        : err.message === "Project not found"
          ? 404
          : 400;
    return c.json({ message: err.message }, status);
  }
};

// ─── create ───────────────────────────────────────────────────────────────────

export const createProject = async (c: Context<AppContext>) => {
  const body = await c.req.json();
  const parsed = CreateProjectDto.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);

  try {
    const { drizzleClient, supabaseClient, userId } = getCtxVars(c);
    const project = await projectService.createProject({
      drizzleClient,
      supabaseClient,
      userId,
      data: parsed.data,
    });
    return c.json(project, 201);
  } catch (err: any) {
    return c.json({ message: err.message }, 400);
  }
};

// ─── update ───────────────────────────────────────────────────────────────────

export const updateProject = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const body = await c.req.json();
  const parsed = UpdateProjectDto.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);

  try {
    const { drizzleClient, supabaseClient, userId } = getCtxVars(c);
    const project = await projectService.updateProjectById({
      drizzleClient,
      supabaseClient,
      projectId,
      userId,
      data: parsed.data,
    });
    return c.json(project, 200);
  } catch (err: any) {
    const status =
      err.message === "Forbidden"
        ? 403
        : err.message === "Project not found"
          ? 404
          : 400;
    return c.json({ message: err.message }, status);
  }
};

// ─── delete ───────────────────────────────────────────────────────────────────

export const deleteProject = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");

  try {
    const { drizzleClient, supabaseClient, userId } = getCtxVars(c);
    await projectService.deleteProjectById({
      drizzleClient,
      supabaseClient,
      projectId,
      userId,
    });
    return c.json({ message: "Project deleted" }, 200);
  } catch (err: any) {
    const status =
      err.message === "Forbidden"
        ? 403
        : err.message === "Project not found"
          ? 404
          : 400;
    return c.json({ message: err.message }, status);
  }
};
