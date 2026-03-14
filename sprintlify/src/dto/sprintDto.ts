import { z } from "zod";

export const CreateSprintDto = z
  .object({
    sprintName: z.string().min(1),
    goal: z.string().optional(),
    startDate: z.string().date(), // expects "YYYY-MM-DD"
    endDate: z.string().date(), // expects "YYYY-MM-DD"
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const duration =
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      return duration >= 1 && duration <= 30;
    },
    {
      message: "Sprint duration must be between 1 and 30 days",
      path: ["endDate"],
    },
  );

export const UpdateSprintDto = z
  .object({
    sprintName: z.string().min(1).optional(),
    goal: z.string().optional(),
    startDate: z.string().date().optional(),
    endDate: z.string().date().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        const duration =
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        return duration >= 1 && duration <= 30;
      }
      return true;
    },
    {
      message: "Sprint duration must be between 1 and 30 days",
      path: ["endDate"],
    },
  );

export const AddTicketToSprintDto = z.object({
  ticketId: z.string().uuid(),
});

export type CreateSprintDtoType = z.infer<typeof CreateSprintDto>;
export type UpdateSprintDtoType = z.infer<typeof UpdateSprintDto>;
export type AddTicketToSprintDtoType = z.infer<typeof AddTicketToSprintDto>;
