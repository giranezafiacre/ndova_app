import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .url("Must be a valid URL")
  .optional()
  .or(z.literal(""))
  .transform((value) => value || undefined);

const providerServiceFields = {
  serviceId: z.string().uuid("Invalid service ID"),
  location: z.string().trim().min(1, "Location is required"),
  description: z.string().trim().min(1, "Description is required"),
  durationMinutes: z
    .number({ invalid_type_error: "durationMinutes must be a number" })
    .int("durationMinutes must be a whole number")
    .positive("durationMinutes must be greater than 0"),
  imageUrl: optionalUrl,
  meetingLink: optionalUrl,
};

export const createProviderServiceSchema = z.object(providerServiceFields);

export const updateProviderServiceSchema = z
  .object(providerServiceFields)
  .partial()
  .omit({ serviceId: true });

export type CreateProviderServiceInput = z.infer<
  typeof createProviderServiceSchema
>;
export type UpdateProviderServiceInput = z.infer<
  typeof updateProviderServiceSchema
>;
