import { Context } from "hono";
import { AppContext } from "../types/AppContext";
import { AddMemberDto } from "../dto/projectMemberDto";
import * as projectMemberService from "../service/projectMemberService";
import { getCtxBind } from "../helper/getCtxBind";
import { getCtxVars } from "../helper/getCtxVars";

export const getProjectMembers = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
    const { drizzleClient, supabaseClient, user } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    
    const members = await projectMemberService.getProjectMembers({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      userId:user.id,
    });

    return c.json(members, 200);
};

export const addProjectMember = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const body = await c.req.json();
  const parsed = AddMemberDto.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);
    const { drizzleClient, supabaseClient, user } = getCtxVars(c);
    const { kv } = getCtxBind(c);

    const member = await projectMemberService.addProjectMember({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      userId:user.id,
      data: parsed.data,
    });

    return c.json(member, 201);
};

export const removeProjectMember = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const unwantedId = c.req.param("unwantedId");
    const { drizzleClient, supabaseClient, user } = getCtxVars(c);
    const { kv } = getCtxBind(c);

    await projectMemberService.removeProjectMember({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      unwantedId,
      userId:user.id,
    });
    
    return c.json({ message: "Member removed successfully" }, 200);
};
