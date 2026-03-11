import { z } from "zod";

export const CreateProjectDto = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const UpdateProjectDto = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export type CreateProjectDtoType = z.infer<typeof CreateProjectDto>;
export type UpdateProjectDtoType = z.infer<typeof UpdateProjectDto>;
