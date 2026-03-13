// controller/projectMemberController.ts
import { Context } from "hono";
import { AppContext } from "../types/AppContext";
import { AddMemberDto } from "../dto/projectMemberDto";
import * as projectMemberService from "../service/projectMemberService";

const getCtxVars = (c: Context<AppContext>) => ({
  drizzleClient: c.get("drizzleClient"),
  supabaseClient: c.get("supabaseClient"),
  userId: c.get("user").id,
});

const getCtxBind = (c: Context<AppContext>) => ({
  kv: c.env.KVCASH,
});

// ─── get members ──────────────────────────────────────────────────────────────

export const getProjectMembers = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");

  try {
    const { drizzleClient, supabaseClient, userId } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    const members = await projectMemberService.getProjectMembers({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      userId,
    });
    return c.json(members, 200);
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

// ─── add member ───────────────────────────────────────────────────────────────

export const addProjectMember = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const body = await c.req.json();
  const parsed = AddMemberDto.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);

  try {
    const { drizzleClient, supabaseClient, userId } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    const member = await projectMemberService.addProjectMember({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      userId,
      data: parsed.data,
    });
    return c.json(member, 201);
  } catch (err: any) {
    const status =
      err.message === "Forbidden"
        ? 403
        : err.message === "Project not found"
          ? 404
          : err.message === "User not found"
            ? 404
            : 400;
    return c.json({ message: err.message }, status);
  }
};

// ─── remove member ────────────────────────────────────────────────────────────

export const removeProjectMember = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const unwantedId = c.req.param("unwantedId");

  try {
    const { drizzleClient, supabaseClient, userId } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    await projectMemberService.removeProjectMember({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      unwantedId,
      userId,
    });
    return c.json({ message: "Member removed successfully" }, 200);
  } catch (err: any) {
    const status =
      err.message === "Forbidden"
        ? 403
        : err.message === "Project not found"
          ? 404
          : err.message === "User not found"
            ? 404
            : 400;
    return c.json({ message: err.message }, status);
  }
};
