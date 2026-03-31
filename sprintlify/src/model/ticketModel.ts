import { and, asc, count, desc, eq, ilike, or, SQL } from "drizzle-orm";
import { tickets } from "../../drizzle/schema";
import { DrizzleClientType } from "../types/drizzleClientType";
import { SupabaseClientType } from "../types/supabaseClientType";
import { TicketFilterDtoType, UpdateTicketDtoType } from "../dto/ticketDto";
import { dbQuery } from "../helper/dbQuery";
import { DatabaseError, NotFoundError } from "../error/AppError";

export const findTicketsByProjectId = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
  filters: TicketFilterDtoType;
}) => {
  const { drizzleClient, projectId, filters } = { ...params };
  const {
    status,
    priority,
    assigneeId,
    label,
    search,
    sortBy,
    sortOrder,
    page,
    limit,
  } = filters;

  const conditions: SQL[] = [eq(tickets.projectId, projectId)];

  if (status) conditions.push(eq(tickets.status, status));
  if (priority) conditions.push(eq(tickets.priority, priority));
  if (assigneeId) conditions.push(eq(tickets.assigneeId, assigneeId));
  if (label) conditions.push(eq(tickets.label, label));
  if (search) {
    conditions.push(
      or(
        ilike(tickets.title, `%${search}%`),
        ilike(tickets.description, `%${search}%`),
      )!,
    );
  }

  const orderByColumn =
    sortBy === "priority"
      ? tickets.priority
      : sortBy === "status"
        ? tickets.status
        : tickets.createdAt;

  const orderBy =
    sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn);

  const offset = (page - 1) * limit;

  const [data, totalResult] = await Promise.all([
    dbQuery(() =>
      drizzleClient
        .select()
        .from(tickets)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
    ),

    dbQuery(() =>
      drizzleClient
        .select({ count: count() })
        .from(tickets)
        .where(and(...conditions)),
    ),
  ]);

  const total = totalResult[0].count;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

export const findTicketById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  ticketId: string;
  projectId: string;
}) => {
  const { drizzleClient, ticketId, projectId } = { ...params };

  const result = await dbQuery(() =>
    drizzleClient
      .select()
      .from(tickets)
      .where(
        and(eq(tickets.ticketId, ticketId), eq(tickets.projectId, projectId)),
      ),
  );

  if (!result[0]) throw new NotFoundError();

  return result[0];
};

export const insertTicket = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  data: {
    title: string;
    description?: string;
    priority: string;
    label?: string;
    assigneeId?: string;
    userId: string;
    projectId: string;
  };
}) => {
  const { drizzleClient, data } = { ...params };

  const result = await dbQuery(() =>
    drizzleClient.insert(tickets).values(data).returning(),
  );

  if (!result[0]) throw new DatabaseError();

  return result[0];
};

export const updateTicket = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  ticketId: string;
  data: UpdateTicketDtoType;
}) => {
  const { drizzleClient, ticketId, data } = { ...params };

  const result = await dbQuery(() =>
    drizzleClient
      .update(tickets)
      .set(data)
      .where(eq(tickets.ticketId, ticketId))
      .returning(),
  );

  if (!result[0]) throw new DatabaseError();

  return result[0];
};

export const findTicketsBySprintId = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  sprintId: string;
}) => {
  const { drizzleClient, sprintId } = { ...params };

  const result = await dbQuery(() =>
    drizzleClient.select().from(tickets).where(eq(tickets.sprintId, sprintId)),
  );

  return result[0] ? result[0] : [];
};

// ─── delete ───────────────────────────────────────────────────────────────────

export const deleteTicket = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  ticketId: string;
}) => {
  const { drizzleClient, ticketId } = { ...params };

  await dbQuery(() =>
    drizzleClient.delete(tickets).where(eq(tickets.ticketId, ticketId)),
  );
};
