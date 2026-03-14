import { DrizzleClientType } from "../types/drizzleClientType";
import { SupabaseClientType } from "../types/supabaseClientType";
import { CreateSprintDtoType, UpdateSprintDtoType } from "../dto/sprintDto";
import {
  findSprintsByProjectId,
  findSprintById,
  findActiveSprintByProjectId,
  findSprintWithTickets,
  findBacklogByProjectId,
  insertSprint,
  updateSprint,
  updateSprintStatus,
  addTicketToSprint,
  removeTicketFromSprint,
  moveUnfinishedTicketsToBacklog,
  deleteSprint,
} from "../model/sprintModel";
import { findTicketById } from "../model/ticketModel";
import { findProjectById } from "../model/projectModel";
import { findProjectMember } from "../model/projectMemberModel";
import { cacheKeys } from "../cache/cacheKeys";
import { cacheDel, cacheGet, cacheSet } from "../cache/kvCache";
import { KVNamespace } from "@cloudflare/workers-types";

// ─── verify helpers ───────────────────────────────────────────────────────────

const verifyMembership = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
  userId: string;
}) => {
  const member = await findProjectMember({ ...params });
  if (!member) throw new Error("Forbidden");
  return member;
};

const verifyOwner = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
  userId: string;
}) => {
  const { drizzleClient, supabaseClient, projectId, userId } = {
    ...params,
  };

  const project = await findProjectById({
    drizzleClient,
    supabaseClient,
    projectId,
  });
  if (!project) throw new Error("Project not found");
  if (project.ownerId !== userId) throw new Error("Forbidden");

  return project;
};

const verifySprintExists = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  sprintId: string;
  projectId: string;
}) => {
  const sprint = await findSprintById({ ...params });
  if (!sprint) throw new Error("Sprint not found");
  return sprint;
};

// ─── get all sprints ──────────────────────────────────────────────────────────

export const getSprints = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  userId: string;
}) => {
  const { drizzleClient, supabaseClient, kv, projectId, userId } = {
    ...params,
  };

  await verifyMembership({
    drizzleClient,
    supabaseClient,
    projectId,
    userId: userId,
  });

  const cacheKey = cacheKeys.project_sprints(projectId);
  const cached = await cacheGet({ kv, key: cacheKey });
  if (cached) return cached;

  const data = await findSprintsByProjectId({
    drizzleClient,
    supabaseClient,
    projectId,
  });

  await cacheSet({ kv, key: cacheKey, data });

  return data;
};

// ─── get active sprint ────────────────────────────────────────────────────────

export const getActiveSprint = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  userId: string;
}) => {
  const { drizzleClient, supabaseClient, kv, projectId, userId } = {
    ...params,
  };

  await verifyMembership({
    drizzleClient,
    supabaseClient,
    projectId,
    userId: userId,
  });

  const cacheKey = cacheKeys.sprint_active(projectId);
  const cached = await cacheGet({ kv, key: cacheKey });
  if (cached) return cached;

  const data = await findActiveSprintByProjectId({
    drizzleClient,
    supabaseClient,
    projectId,
  });

  if (data) await cacheSet({ kv, key: cacheKey, data });

  return data;
};

// ─── get sprint by id ─────────────────────────────────────────────────────────

export const getSprintById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  sprintId: string;
  userId: string;
}) => {
  const { drizzleClient, supabaseClient, kv, projectId, sprintId, userId } = {
    ...params,
  };

  await verifyMembership({
    drizzleClient,
    supabaseClient,
    projectId,
    userId: userId,
  });

  const cacheKey = cacheKeys.sprint(sprintId);
  const cached = await cacheGet({ kv, key: cacheKey });
  if (cached) return cached;

  const data = await findSprintWithTickets({
    drizzleClient,
    supabaseClient,
    sprintId,
    projectId,
  });
  if (!data) throw new Error("Sprint not found");

  await cacheSet({ kv, key: cacheKey, data });

  return data;
};

// ─── get backlog ──────────────────────────────────────────────────────────────

export const getBacklog = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  userId: string;
}) => {
  const { drizzleClient, supabaseClient, kv, projectId, userId } = {
    ...params,
  };

  await verifyMembership({
    drizzleClient,
    supabaseClient,
    projectId,
    userId: userId,
  });

  const cacheKey = cacheKeys.project_backlog(projectId);
  const cached = await cacheGet({ kv, key: cacheKey });
  if (cached) return cached;

  const data = await findBacklogByProjectId({
    drizzleClient,
    supabaseClient,
    projectId,
  });

  await cacheSet({ kv, key: cacheKey, data });

  return data;
};

// ─── create sprint ────────────────────────────────────────────────────────────

export const createSprint = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  userId: string;
  data: CreateSprintDtoType;
}) => {
  const { drizzleClient, supabaseClient, kv, projectId, userId, data } = {
    ...params,
  };

  await verifyOwner({ drizzleClient, supabaseClient, projectId, userId });

  const sprint = await insertSprint({
    drizzleClient,
    supabaseClient,
    data: { ...data, projectId, createdBy: userId },
  });

  const updatedSprints = await findSprintsByProjectId({
    drizzleClient,
    supabaseClient,
    projectId,
  });

  await Promise.all([
    cacheSet({ kv, key: cacheKeys.sprint(sprint.sprintId), data: sprint }),
    cacheSet({
      kv,
      key: cacheKeys.project_sprints(projectId),
      data: updatedSprints,
    }),
  ]);

  return sprint;
};

// ─── update sprint ────────────────────────────────────────────────────────────

export const updateSprintById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  sprintId: string;
  userId: string;
  data: UpdateSprintDtoType;
}) => {
  const {
    drizzleClient,
    supabaseClient,
    kv,
    projectId,
    sprintId,
    userId,
    data,
  } = {
    ...params,
  };

  await verifyOwner({ drizzleClient, supabaseClient, projectId, userId });

  const sprint = await verifySprintExists({
    drizzleClient,
    supabaseClient,
    sprintId,
    projectId,
  });

  // can only update a planned sprint
  if (sprint.status !== "planned")
    throw new Error("Only planned sprints can be updated");

  const updatedSprint = await updateSprint({
    drizzleClient,
    supabaseClient,
    sprintId,
    data,
  });

  const updatedSprints = await findSprintsByProjectId({
    drizzleClient,
    supabaseClient,
    projectId,
  });

  await Promise.all([
    cacheSet({ kv, key: cacheKeys.sprint(sprintId), data: updatedSprint }),
    cacheSet({
      kv,
      key: cacheKeys.project_sprints(projectId),
      data: updatedSprints,
    }),
  ]);

  return updatedSprint;
};

// ─── start sprint ─────────────────────────────────────────────────────────────

export const startSprint = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  sprintId: string;
  userId: string;
}) => {
  const { drizzleClient, supabaseClient, kv, projectId, sprintId, userId } = {
    ...params,
  };

  await verifyOwner({ drizzleClient, supabaseClient, projectId, userId });

  const sprint = await verifySprintExists({
    drizzleClient,
    supabaseClient,
    sprintId,
    projectId,
  });

  // can only start a planned sprint
  if (sprint.status !== "planned")
    throw new Error("Only planned sprints can be started");

  // check no other sprint is active — enforced at DB level too but we give a clear message
  const activeSprint = await findActiveSprintByProjectId({
    drizzleClient,
    supabaseClient,
    projectId,
  });
  if (activeSprint)
    throw new Error("A sprint is already active for this project");

  const updatedSprint = await updateSprintStatus({
    drizzleClient,
    supabaseClient,
    sprintId,
    status: "active",
  });

  const updatedSprints = await findSprintsByProjectId({
    drizzleClient,
    supabaseClient,
    projectId,
  });

  await Promise.all([
    cacheSet({ kv, key: cacheKeys.sprint(sprintId), data: updatedSprint }),
    cacheSet({
      kv,
      key: cacheKeys.sprint_active(projectId),
      data: updatedSprint,
    }),
    cacheSet({
      kv,
      key: cacheKeys.project_sprints(projectId),
      data: updatedSprints,
    }),
  ]);

  return updatedSprint;
};

// ─── complete sprint ──────────────────────────────────────────────────────────

export const completeSprint = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  sprintId: string;
  userId: string;
}) => {
  const { drizzleClient, supabaseClient, kv, projectId, sprintId, userId } = {
    ...params,
  };

  await verifyOwner({ drizzleClient, supabaseClient, projectId, userId });

  const sprint = await verifySprintExists({
    drizzleClient,
    supabaseClient,
    sprintId,
    projectId,
  });

  // can only complete an active sprint
  if (sprint.status !== "active")
    throw new Error("Only active sprints can be completed");

  // move unfinished tickets back to backlog and complete sprint in parallel
  const [updatedSprint, unfinishedTickets] = await Promise.all([
    updateSprintStatus({
      drizzleClient,
      supabaseClient,
      sprintId,
      status: "completed",
    }),
    moveUnfinishedTicketsToBacklog({ drizzleClient, supabaseClient, sprintId }),
  ]);

  // build sprint report
  const allTickets = await findSprintWithTickets({
    drizzleClient,
    supabaseClient,
    sprintId,
    projectId,
  });

  const report = buildSprintReport({
    sprint: updatedSprint!,
    tickets: allTickets!.tickets,
  });

  const updatedSprints = await findSprintsByProjectId({
    drizzleClient,
    supabaseClient,
    projectId,
  });

  const updatedBacklog = await findBacklogByProjectId({
    drizzleClient,
    supabaseClient,
    projectId,
  });

  await Promise.all([
    cacheSet({ kv, key: cacheKeys.sprint(sprintId), data: updatedSprint }),
    cacheSet({ kv, key: cacheKeys.sprint_report(sprintId), data: report }),
    cacheSet({
      kv,
      key: cacheKeys.project_sprints(projectId),
      data: updatedSprints,
    }),
    cacheSet({
      kv,
      key: cacheKeys.project_backlog(projectId),
      data: updatedBacklog,
    }),
    cacheDel({ kv, key: cacheKeys.sprint_active(projectId) }),
    cacheDel({ kv, key: cacheKeys.project_tickets(projectId) }),
  ]);

  return { sprint: updatedSprint, report };
};

// ─── delete sprint ────────────────────────────────────────────────────────────

export const deleteSprintById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  sprintId: string;
  userId: string;
}) => {
  const { drizzleClient, supabaseClient, kv, projectId, sprintId, userId } = {
    ...params,
  };

  await verifyOwner({ drizzleClient, supabaseClient, projectId, userId });

  const sprint = await verifySprintExists({
    drizzleClient,
    supabaseClient,
    sprintId,
    projectId,
  });

  // can only delete a planned sprint
  if (sprint.status !== "planned")
    throw new Error("Only planned sprints can be deleted");

  await deleteSprint({ drizzleClient, supabaseClient, sprintId });

  const updatedSprints = await findSprintsByProjectId({
    drizzleClient,
    supabaseClient,
    projectId,
  });

  await Promise.all([
    cacheSet({
      kv,
      key: cacheKeys.project_sprints(projectId),
      data: updatedSprints,
    }),
    cacheDel({ kv, key: cacheKeys.sprint(sprintId) }),
  ]);
};

// ─── add ticket to sprint ─────────────────────────────────────────────────────

export const addTicketToSprintById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  sprintId: string;
  ticketId: string;
  userId: string;
}) => {
  const {
    drizzleClient,
    supabaseClient,
    kv,
    projectId,
    sprintId,
    ticketId,
    userId,
  } = {
    ...params,
  };

  await verifyMembership({
    drizzleClient,
    supabaseClient,
    projectId,
    userId: userId,
  });

  const sprint = await verifySprintExists({
    drizzleClient,
    supabaseClient,
    sprintId,
    projectId,
  });

  // can only add tickets to a planned or active sprint
  if (sprint.status === "completed")
    throw new Error("Cannot add tickets to a completed sprint");

  const ticket = await findTicketById({
    drizzleClient,
    supabaseClient,
    ticketId,
    projectId,
  });
  if (!ticket) throw new Error("Ticket not found");

  // ticket already in this sprint
  if (ticket.sprintId === sprintId)
    throw new Error("Ticket already in this sprint");

  const updatedTicket = await addTicketToSprint({
    drizzleClient,
    supabaseClient,
    ticketId,
    sprintId,
  });

  const [updatedSprintWithTickets, updatedBacklog] = await Promise.all([
    findSprintWithTickets({
      drizzleClient,
      supabaseClient,
      sprintId,
      projectId,
    }),
    findBacklogByProjectId({ drizzleClient, supabaseClient, projectId }),
  ]);

  await Promise.all([
    cacheSet({
      kv,
      key: cacheKeys.sprint(sprintId),
      data: updatedSprintWithTickets,
    }),
    cacheSet({ kv, key: cacheKeys.ticket(ticketId), data: updatedTicket }),
    cacheSet({
      kv,
      key: cacheKeys.project_backlog(projectId),
      data: updatedBacklog,
    }),
    cacheDel({ kv, key: cacheKeys.project_tickets(projectId) }),
  ]);

  return updatedTicket;
};

// ─── remove ticket from sprint ────────────────────────────────────────────────

export const removeTicketFromSprintById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  sprintId: string;
  ticketId: string;
  userId: string;
}) => {
  const {
    drizzleClient,
    supabaseClient,
    kv,
    projectId,
    sprintId,
    ticketId,
    userId,
  } = {
    ...params,
  };

  await verifyMembership({
    drizzleClient,
    supabaseClient,
    projectId,
    userId: userId,
  });

  const sprint = await verifySprintExists({
    drizzleClient,
    supabaseClient,
    sprintId,
    projectId,
  });

  // can only remove tickets from a planned or active sprint
  if (sprint.status === "completed")
    throw new Error("Cannot remove tickets from a completed sprint");

  const ticket = await findTicketById({
    drizzleClient,
    supabaseClient,
    ticketId,
    projectId,
  });
  if (!ticket) throw new Error("Ticket not found");

  // ticket not in this sprint
  if (ticket.sprintId !== sprintId)
    throw new Error("Ticket is not in this sprint");

  const updatedTicket = await removeTicketFromSprint({
    drizzleClient,
    supabaseClient,
    ticketId,
  });

  const [updatedSprintWithTickets, updatedBacklog] = await Promise.all([
    findSprintWithTickets({
      drizzleClient,
      supabaseClient,
      sprintId,
      projectId,
    }),
    findBacklogByProjectId({ drizzleClient, supabaseClient, projectId }),
  ]);

  await Promise.all([
    cacheSet({
      kv,
      key: cacheKeys.sprint(sprintId),
      data: updatedSprintWithTickets,
    }),
    cacheSet({ kv, key: cacheKeys.ticket(ticketId), data: updatedTicket }),
    cacheSet({
      kv,
      key: cacheKeys.project_backlog(projectId),
      data: updatedBacklog,
    }),
    cacheDel({ kv, key: cacheKeys.project_tickets(projectId) }),
  ]);

  return updatedTicket;
};

// ─── sprint report builder ────────────────────────────────────────────────────

const buildSprintReport = (params: { sprint: any; tickets: any[] }) => {
  const { sprint, tickets } = { ...params };

  const total = tickets.length;
  const completed = tickets.filter((t) => t.status === "closed").length;
  const incomplete = total - completed;

  const byPriority = ["critical", "high", "medium", "low"].reduce(
    (acc, priority) => {
      const priorityTickets = tickets.filter((t) => t.priority === priority);
      acc[priority] = {
        total: priorityTickets.length,
        completed: priorityTickets.filter((t) => t.status === "closed").length,
      };
      return acc;
    },
    {} as Record<string, { total: number; completed: number }>,
  );

  const byLabel = [
    "bug",
    "feature",
    "infra",
    "docs",
    "security",
    "perf",
  ].reduce(
    (acc, label) => {
      const labelTickets = tickets.filter((t) => t.label === label);
      acc[label] = {
        total: labelTickets.length,
        completed: labelTickets.filter((t) => t.status === "closed").length,
      };
      return acc;
    },
    {} as Record<string, { total: number; completed: number }>,
  );

  const start = new Date(sprint.startDate);
  const end = new Date(sprint.endDate);
  const duration = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );

  return {
    sprintId: sprint.sprintId,
    name: sprint.name,
    goal: sprint.goal,
    startDate: sprint.startDate,
    endDate: sprint.endDate,
    duration,
    summary: {
      total,
      completed,
      incomplete,
      completionRate:
        total > 0 ? `${Math.round((completed / total) * 100)}%` : "0%",
    },
    byPriority,
    byLabel,
    uncompletedTickets: tickets
      .filter((t) => t.status !== "closed")
      .map((t) => ({
        ticketId: t.ticketId,
        title: t.title,
        priority: t.priority,
        status: t.status,
      })),
  };
};
