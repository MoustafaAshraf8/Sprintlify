import { and, eq, isNull, ne } from "drizzle-orm";
import { sprints, tickets } from "../../drizzle/schema";
import { DrizzleClientType } from "../types/drizzleClientType";
import { SupabaseClientType } from "../types/supabaseClientType";
import { UpdateSprintDtoType } from "../dto/sprintDto";
import { dbQuery } from "../helper/dbQuery";
import { NotFoundError } from "../error/AppError";
import { DatabaseError } from "../error/AppError";

export const findSprintsByProjectId = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
}) => {
  const { drizzleClient, projectId } = { ...params };

  return await dbQuery(() =>
    drizzleClient
      .select()
      .from(sprints)
      .where(eq(sprints.projectId, projectId)),
  );
};

export const findSprintById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  sprintId: string;
  projectId: string;
}) => {
  const { drizzleClient, sprintId, projectId } = { ...params };

  const result = await dbQuery(() =>
    drizzleClient
      .select()
      .from(sprints)
      .where(
        and(eq(sprints.sprintId, sprintId), eq(sprints.projectId, projectId)),
      ),
  );
  if (!result[0]) throw new NotFoundError();

  return result[0];
};

export const findActiveSprintByProjectId = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
}) => {
  const { drizzleClient, projectId } = { ...params };

  const result = await dbQuery(() =>
    drizzleClient
      .select()
      .from(sprints)
      .where(
        and(eq(sprints.projectId, projectId), eq(sprints.status, "active")),
      ),
  );

  return result[0];
};

export const findSprintWithTickets = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  sprintId: string;
  projectId: string;
}) => {
  const { drizzleClient, sprintId, projectId } = { ...params };

  const result = await dbQuery(() =>
    drizzleClient
      .select({
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
      ),
  );

  if (!result[0]) throw new NotFoundError();

  const { ticket, ...sprintData } = result[0];

  return {
    ...sprintData,
    tickets:
      result
        .filter((row) => (row.ticket ? row.ticket.ticketId : null))
        .map((row) => row.ticket) ?? [],
  };
};

export const findBacklogByProjectId = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
}) => {
  const { drizzleClient, projectId } = { ...params };

  return await dbQuery(() =>
    drizzleClient
      .select()
      .from(tickets)
      .where(and(eq(tickets.projectId, projectId), isNull(tickets.sprintId))),
  );
};

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

  const result = await dbQuery(() =>
    drizzleClient.insert(sprints).values(data).returning(),
  );

  if (!result[0]) throw new DatabaseError();

  return result[0];
};

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

  if (!result[0]) throw new DatabaseError();

  return result[0];
};

export const updateSprintStatus = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  sprintId: string;
  status: "active" | "completed";
}) => {
  const { drizzleClient, sprintId, status } = { ...params };

  const result = await dbQuery(() =>
    drizzleClient
      .update(sprints)
      .set({ status: status })
      .where(eq(sprints.sprintId, sprintId))
      .returning(),
  );

  if (!result[0]) throw new DatabaseError();

  return result[0];
};

export const addTicketToSprint = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  ticketId: string;
  sprintId: string;
}) => {
  const { drizzleClient, ticketId, sprintId } = { ...params };

  const result = await dbQuery(() =>
    drizzleClient
      .update(tickets)
      .set({ sprintId: sprintId })
      .where(eq(tickets.ticketId, ticketId))
      .returning(),
  );

  if (!result[0]) throw new DatabaseError();

  return result[0];
};

export const removeTicketFromSprint = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  ticketId: string;
}) => {
  const { drizzleClient, ticketId } = { ...params };

  const result = await dbQuery(() =>
    drizzleClient
      .update(tickets)
      .set({ sprintId: null })
      .where(eq(tickets.ticketId, ticketId))
      .returning(),
  );

  if (!result[0]) throw new DatabaseError();

  return result[0];
};

export const completeSprintAndRemoveTicketsToBacklog = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  sprintId: string;
  status: "active" | "completed";
}) => {
  const { drizzleClient, sprintId, status } = { ...params };

  const result = await drizzleClient.transaction(async (tx) => {
    const updateSprintResult = await dbQuery(() =>
      drizzleClient
        .update(sprints)
        .set({ status: status })
        .where(eq(sprints.sprintId, sprintId))
        .returning(),
    );

    if (!updateSprintResult[0]) throw new DatabaseError();

    const movedTickets = await tx
      .update(tickets)
      .set({ sprintId: null })
      .where(and(eq(tickets.sprintId, sprintId), ne(tickets.status, "closed")))
      .returning();

    return updateSprintResult[0];
  });

  return result;
};

export const moveUnfinishedTicketsToBacklog = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  sprintId: string;
}) => {
  const { drizzleClient, sprintId } = { ...params };

  const result = await dbQuery(() =>
    drizzleClient
      .update(tickets)
      .set({ sprintId: null })
      .where(and(eq(tickets.sprintId, sprintId), ne(tickets.status, "closed")))
      .returning(),
  );

  if (!result[0]) throw new DatabaseError();

  return result[0];
};

export const deleteSprint = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  sprintId: string;
}) => {
  const { drizzleClient, sprintId } = { ...params };

  const result = await drizzleClient
    .delete(sprints)
    .where(eq(sprints.sprintId, sprintId))
    .returning();

  if (!result[0]) throw new DatabaseError();

  return result[0];
};
