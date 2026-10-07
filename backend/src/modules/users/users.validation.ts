import { z } from "zod";

export const updateUserSchema = z.object({
  firstName: z.string().min(1, "First name cannot be empty").trim().optional(),
  lastName: z.string().min(1, "Last name cannot be empty").trim().optional(),
  phone: z.string().trim().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
