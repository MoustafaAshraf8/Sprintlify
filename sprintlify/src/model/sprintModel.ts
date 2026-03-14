// src/model/sprintModel.ts
import { and, eq, isNull, ne } from "drizzle-orm";
import { sprints, tickets } from "../../drizzle/schema";
import { DrizzleClientType } from "../types/drizzleClientType";
import { SupabaseClientType } from "../types/supabaseClientType";
import { CreateSprintDtoType, UpdateSprintDtoType } from "../dto/sprintDto";

// ─── find all by project ──────────────────────────────────────────────────────

export const findSprintsByProjectId = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
}) => {
  const { drizzleClient, projectId } = { ...params };

  return await drizzleClient
    .select()
    .from(sprints)
    .where(eq(sprints.projectId, projectId));
};

// ─── find by id ───────────────────────────────────────────────────────────────

export const findSprintById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  sprintId: string;
  projectId: string;
}) => {
  const { drizzleClient, sprintId, projectId } = { ...params };

  const result = await drizzleClient
    .select()
    .from(sprints)
    .where(
      and(eq(sprints.sprintId, sprintId), eq(sprints.projectId, projectId)),
    )
    .limit(1);

  return result[0] ?? null;
};

// ─── find active sprint by project ───────────────────────────────────────────

export const findActiveSprintByProjectId = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
}) => {
  const { drizzleClient, projectId } = { ...params };

  const result = await drizzleClient
    .select()
    .from(sprints)
    .where(and(eq(sprints.projectId, projectId), eq(sprints.status, "active")))
    .limit(1);

  return result[0] ?? null;
};

// ─── find sprint with tickets ─────────────────────────────────────────────────

export const findSprintWithTickets = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  sprintId: string;
  projectId: string;
}) => {
  const { drizzleClient, sprintId, projectId } = { ...params };

  const result = await drizzleClient
    .select({
      // ─── sprint fields ──────────────────────────────────────────────────────
      sprintId: sprints.sprintId,
      projectId: sprints.projectId,
      sprintName: sprints.sprintName,
      goal: sprints.goal,
      status: sprints.status,
      startDate: sprints.startDate,
      endDate: sprints.endDate,
      createdBy: sprints.createdBy,
      createdAt: sprints.createdAt,
      updatedAt: sprints.updatedAt,
      // ─── ticket fields ──────────────────────────────────────────────────────
      ticket: {
        ticketId: tickets.ticketId,
        title: tickets.title,
        description: tickets.description,
        priority: tickets.priority,
        status: tickets.status,
        label: tickets.label,
        assigneeId: tickets.assigneeId,
        reporterId: tickets.reporterId,
        sprintId: tickets.sprintId,
        createdAt: tickets.createdAt,
        updatedAt: tickets.updatedAt,
      },
    })
    .from(sprints)
    .leftJoin(tickets, eq(tickets.sprintId, sprints.sprintId))
    .where(
      and(eq(sprints.sprintId, sprintId), eq(sprints.projectId, projectId)),
    );

  const { ticket, ...sprintData } = result[0];

  return result.length != 0
    ? {
        ...sprintData,
        tickets: result
          .filter((row) => row.ticket!.ticketId !== null)
          .map((row) => row.ticket),
      }
    : null;
};

// ─── find backlog ─────────────────────────────────────────────────────────────

export const findBacklogByProjectId = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
}) => {
  const { drizzleClient, projectId } = { ...params };

  return await drizzleClient
    .select()
    .from(tickets)
    .where(and(eq(tickets.projectId, projectId), isNull(tickets.sprintId)));
};

// ─── insert ───────────────────────────────────────────────────────────────────

export const insertSprint = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  data: {
    projectId: string;
    sprintName: string;
    goal?: string;
    startDate: string;
    endDate: string;
    createdBy: string;
  };
}) => {
  const { drizzleClient, data } = { ...params };

  const result = await drizzleClient.insert(sprints).values(data).returning();

  return result[0];
};

// ─── update ───────────────────────────────────────────────────────────────────

export const updateSprint = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  sprintId: string;
  data: UpdateSprintDtoType;
}) => {
  const { drizzleClient, sprintId, data } = { ...params };

  const result = await drizzleClient
    .update(sprints)
    .set(data)
    .where(eq(sprints.sprintId, sprintId))
    .returning();

  return result[0] ?? null;
};

// ─── update sprint status ─────────────────────────────────────────────────────

export const updateSprintStatus = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  sprintId: string;
  status: "active" | "completed";
}) => {
  const { drizzleClient, sprintId, status } = { ...params };

  const result = await drizzleClient
    .update(sprints)
    .set({ status: status })
    .where(eq(sprints.sprintId, sprintId))
    .returning();

  return result[0] ?? null;
};

// ─── add ticket to sprint ─────────────────────────────────────────────────────

export const addTicketToSprint = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  ticketId: string;
  sprintId: string;
}) => {
  const { drizzleClient, ticketId, sprintId } = { ...params };

  const result = await drizzleClient
    .update(tickets)
    .set({ sprintId: sprintId })
    .where(eq(tickets.ticketId, ticketId))
    .returning();

  return result[0] ?? null;
};

// ─── remove ticket from sprint (back to backlog) ──────────────────────────────

export const removeTicketFromSprint = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  ticketId: string;
}) => {
  const { drizzleClient, ticketId } = { ...params };

  const result = await drizzleClient
    .update(tickets)
    .set({ sprintId: null })
    .where(eq(tickets.ticketId, ticketId))
    .returning();

  return result[0] ?? null;
};

// ─── move unfinished tickets to backlog ───────────────────────────────────────

export const moveUnfinishedTicketsToBacklog = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  sprintId: string;
}) => {
  const { drizzleClient, sprintId } = { ...params };

  return await drizzleClient
    .update(tickets)
    .set({ sprintId: null })
    .where(and(eq(tickets.sprintId, sprintId), ne(tickets.status, "closed")))
    .returning();
};

// ─── delete ───────────────────────────────────────────────────────────────────

export const deleteSprint = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  sprintId: string;
}) => {
  const { drizzleClient, sprintId } = { ...params };

  await drizzleClient.delete(sprints).where(eq(sprints.sprintId, sprintId));
};
