import { z } from "zod";

export const AddMemberDto = z.object({
  userId: z.string().uuid(),
});

export type AddMemberDtoType = z.infer<typeof AddMemberDto>;
