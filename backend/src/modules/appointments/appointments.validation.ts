import { z } from "zod";

export const createAppointmentSchema = z.object({
  serviceId: z.string().uuid("Invalid service ID"),
  providerId: z.string().uuid("Invalid provider ID").optional(),
  providerServiceId: z.string().uuid("Invalid provider service ID").optional(),
  requestedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  requestedTime: z
    .string()
    .regex(/^([0-1]?\d|2[0-3]):[0-5]\d$/, "Time must be HH:MM"),
  reason: z.string().trim().optional(),
  sessionType: z.enum(["IN_PERSON", "ONLINE"]).optional(),
});

export const approveAppointmentSchema = z.object({
  // Admin can assign or re-assign a provider at approval time
  providerId: z.string().uuid("Invalid provider ID").optional(),
  adminNote: z.string().trim().optional(),
});

export const rejectAppointmentSchema = z.object({
  adminNote: z.string().trim().optional(),
});

export const cancelAppointmentSchema = z.object({
  note: z.string().trim().optional(),
});

export const completeAppointmentSchema = z.object({
  adminNote: z.string().trim().optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type ApproveAppointmentInput = z.infer<typeof approveAppointmentSchema>;
export type RejectAppointmentInput = z.infer<typeof rejectAppointmentSchema>;
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>;
export type CompleteAppointmentInput = z.infer<
  typeof completeAppointmentSchema
>;
