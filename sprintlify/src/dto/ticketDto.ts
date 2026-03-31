import { z } from "zod";

export const CreateTicketDto = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["critical", "high", "medium", "low"]).default("medium"),
  label: z
    .enum(["bug", "feature", "infra", "docs", "security", "perf"])
    .optional(),
  sprintId: z.string().uuid().nullable().optional(),
});

export const UpdateTicketDto = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.enum(["critical", "high", "medium", "low"]).optional(),
  status: z.enum(["open", "in progress", "review", "closed"]).optional(),
  label: z
    .enum(["bug", "feature", "infra", "docs", "security", "perf"])
    .optional(),
  sprintId: z.string().uuid().nullable().optional(),
});

export const TicketFilterDto = z.object({
  status: z.enum(["open", "in progress", "review", "closed"]).optional(),
  priority: z.enum(["critical", "high", "medium", "low"]).optional(),
  assigneeId: z.string().uuid().optional(),
  label: z
    .enum(["bug", "feature", "infra", "docs", "security", "perf"])
    .optional(),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "priority", "status"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export const CreateTicketCommentDto = z.object({
  body: z.string().min(1),
});

export type CreateTicketDtoType = z.infer<typeof CreateTicketDto>;
export type UpdateTicketDtoType = z.infer<typeof UpdateTicketDto>;
export type TicketFilterDtoType = z.infer<typeof TicketFilterDto>;
export type CreateTicketCommentDtoType = z.infer<typeof CreateTicketCommentDto>;
