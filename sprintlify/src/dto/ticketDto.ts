import { z } from "zod";

export const CreateTicketDto = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["critical", "high", "medium", "low"]).default("medium"),
  label: z
    .enum(["bug", "feature", "infra", "docs", "security", "perf"])
    .optional(),
  assigneeId: z.string().uuid().optional(),
});

export const UpdateTicketDto = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.enum(["critical", "high", "medium", "low"]).optional(),
  status: z.enum(["open", "in progress", "review", "closed"]).optional(),
  label: z
    .enum(["bug", "feature", "infra", "docs", "security", "perf"])
    .optional(),
  assigneeId: z.string().uuid().optional(),
});

export type CreateTicketDtoType = z.infer<typeof CreateTicketDto>;
export type UpdateTicketDtoType = z.infer<typeof UpdateTicketDto>;
