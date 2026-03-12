import { z } from "zod";

export const UpdateUserDto = z.object({
  username: z.string().min(3).optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  nickname: z.string().optional(),
});

export type UpdateUserDtoType = z.infer<typeof UpdateUserDto>;
