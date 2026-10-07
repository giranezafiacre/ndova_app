import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  description: z.string().trim().optional(),
});

export const updateServiceSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").trim().optional(),
  description: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
