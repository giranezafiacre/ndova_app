import { Op } from "sequelize";
import { sequelize } from "../../config/database";
import {
  User,
  Role,
  UserRole,
  Service,
  ProviderService,
  Appointment,
  AppointmentStatusHistory,
} from "../../models";
import { AppointmentStatus } from "../../types/enums";
import { ApiError } from "../../utils/ApiError";
import type {
  CreateAppointmentInput,
  ApproveAppointmentInput,
  RejectAppointmentInput,
  CancelAppointmentInput,
  CompleteAppointmentInput,
} from "./appointments.validation";

// Eager-load associations needed for all appointment responses
const appointmentIncludes = {
  include: [
    {
      model: User,
      as: "client",
      attributes: ["id", "firstName", "lastName", "email"],
    },
    {
      model: User,
      as: "provider",
      attributes: ["id", "firstName", "lastName", "email"],
    },
    { model: Service, as: "service", attributes: ["id", "name"] },
    {
      model: ProviderService,
      as: "providerService",
      attributes: [
        "id",
        "durationMinutes",
        "location",
        "meetingLink",
        "imageUrl",
      ],
    },
  ],
};

// ---- Private helpers --------------------------------------------------------

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

async function recordStatusChange(
  appointment: Appointment,
  newStatus: AppointmentStatus,
  changedById: string,
  extras: {
    adminNote?: string | null;
    providerId?: string | null;
    note?: string | null;
  } = {},
) {
  const previousStatus = appointment.status;

  await sequelize.transaction(async (t) => {
    const updatePayload: Record<string, unknown> = { status: newStatus };
    if (extras.adminNote !== undefined)
      updatePayload.adminNote = extras.adminNote;
    if (extras.providerId !== undefined)
      updatePayload.providerId = extras.providerId;

    await appointment.update(updatePayload, { transaction: t });

    await AppointmentStatusHistory.create(
      {
        appointmentId: appointment.id,
        previousStatus,
        newStatus,
        changedById,
        note: extras.adminNote ?? extras.note ?? null,
      },
      { transaction: t },
    );
  });
}

function assertCanView(
  appointment: Appointment,
  userId: string,
  roles: string[],
): void {
  if (roles.includes("ADMIN")) return;
  if (roles.includes("PROVIDER") && appointment.providerId === userId) return;
  if (roles.includes("CLIENT") && appointment.clientId === userId) return;
  throw ApiError.forbidden("You do not have access to this appointment");
}

// PROVIDER can only manage appointments assigned to them; ADMIN can manage any
function assertCanManage(
  appointment: Appointment,
  userId: string,
  roles: string[],
): void {
  if (roles.includes("ADMIN")) return;
  if (roles.includes("PROVIDER") && appointment.providerId === userId) return;
  throw ApiError.forbidden("You can only manage appointments assigned to you");
}

// ---- Public service functions -----------------------------------------------

export async function createAppointment(
  clientId: string,
  input: CreateAppointmentInput,
) {
  const offering = input.providerServiceId
    ? await ProviderService.findByPk(input.providerServiceId, {
        include: [
          {
            model: Service,
            as: "service",
            where: { isActive: true },
            attributes: ["id"],
          },
        ],
      })
    : null;

  if (input.providerServiceId && !offering) {
    throw ApiError.notFound("Provider service not found or inactive");
  }

  const serviceId = offering?.serviceId ?? input.serviceId;
  const providerId = offering?.providerId ?? input.providerId ?? null;
  const service = await Service.findOne({
    where: { id: serviceId, isActive: true },
  });
  if (!service) throw ApiError.notFound("Service not found or inactive");

  if (providerId) {
    const hasRole = await UserRole.findOne({
      where: { userId: providerId },
      include: [{ model: Role, as: "role", where: { name: "PROVIDER" } }],
    });
    if (!hasRole)
      throw ApiError.badRequest("The specified user is not a provider");

    const offering = await ProviderService.findOne({
      where: {
        serviceId,
        providerId,
      },
    });
    if (!offering) {
      throw ApiError.badRequest(
        "The provider does not offer the selected service",
      );
    }
  }

  const sessionType = input.sessionType ?? "IN_PERSON";
  if (sessionType === "ONLINE" && !offering?.meetingLink) {
    throw ApiError.badRequest(
      "Online booking is not available for this provider service",
    );
  }

  if (providerId && offering) {
    const activeAppointments = await Appointment.findAll({
      where: {
        providerId,
        requestedDate: input.requestedDate,
        status: {
          [Op.in]: [AppointmentStatus.PENDING, AppointmentStatus.APPROVED],
        },
      },
      attributes: ["requestedTime", "durationMinutes"],
    });
    const requestedStart = timeToMinutes(input.requestedTime);
    const requestedEnd = requestedStart + offering.durationMinutes;
    const hasConflict = activeAppointments.some((appointment) => {
      const existingStart = timeToMinutes(appointment.requestedTime);
      const existingEnd =
        existingStart +
        (appointment.durationMinutes ?? offering.durationMinutes);
      return requestedStart < existingEnd && requestedEnd > existingStart;
    });
    if (hasConflict) {
      throw ApiError.conflict("The selected time is no longer available");
    }
  }

  const appointment = await sequelize.transaction(async (t) => {
    const appt = await Appointment.create(
      {
        clientId,
        providerId,
        serviceId,
        providerServiceId: offering?.id ?? null,
        requestedDate: new Date(input.requestedDate),
        requestedTime: input.requestedTime,
        durationMinutes: offering?.durationMinutes ?? null,
        sessionType,
        location:
          sessionType === "IN_PERSON" ? (offering?.location ?? null) : null,
        meetingLink:
          sessionType === "ONLINE" ? (offering?.meetingLink ?? null) : null,
        reason: input.reason ?? null,
        status: AppointmentStatus.PENDING,
      },
      { transaction: t },
    );

    // Record the initial PENDING status in history
    await AppointmentStatusHistory.create(
      {
        appointmentId: appt.id,
        previousStatus: null,
        newStatus: AppointmentStatus.PENDING,
        changedById: clientId,
        note: null,
      },
      { transaction: t },
    );

    return appt;
  });

  const full = await Appointment.findByPk(appointment.id, appointmentIncludes);
  return full!.toJSON();
}

export async function listAppointments(userId: string, roles: string[]) {
  const where: Record<string, string> = {};

  if (roles.includes("CLIENT") && !roles.includes("ADMIN")) {
    where.clientId = userId;
  } else if (roles.includes("PROVIDER") && !roles.includes("ADMIN")) {
    where.providerId = userId;
  }
  // ADMIN: no filter — sees everything

  const appointments = await Appointment.findAll({
    where,
    ...appointmentIncludes,
    order: [["createdAt", "DESC"]],
  });

  return appointments.map((a) => a.toJSON());
}

export async function getProviderServiceAvailability(
  providerServiceId: string,
  requestedDate: string,
) {
  const offering = await ProviderService.findByPk(providerServiceId);
  if (!offering) throw ApiError.notFound("Provider service not found");

  const appointments = await Appointment.findAll({
    where: {
      providerId: offering.providerId,
      requestedDate,
      status: {
        [Op.in]: [AppointmentStatus.PENDING, AppointmentStatus.APPROVED],
      },
    },
    attributes: ["id", "requestedTime", "durationMinutes", "status"],
    order: [["requestedTime", "ASC"]],
  });

  return appointments.map((appointment) => ({
    id: appointment.id,
    startTime: appointment.requestedTime,
    durationMinutes: appointment.durationMinutes ?? offering.durationMinutes,
    status: appointment.status,
  }));
}

export async function getAppointmentById(
  id: string,
  userId: string,
  roles: string[],
) {
  const appointment = await Appointment.findByPk(id, appointmentIncludes);
  if (!appointment) throw ApiError.notFound("Appointment not found");
  assertCanView(appointment, userId, roles);
  return appointment.toJSON();
}

export async function approveAppointment(
  id: string,
  userId: string,
  roles: string[],
  input: ApproveAppointmentInput,
) {
  const appointment = await Appointment.findByPk(id);
  if (!appointment) throw ApiError.notFound("Appointment not found");

  assertCanManage(appointment, userId, roles);

  if (appointment.status !== AppointmentStatus.PENDING) {
    throw ApiError.badRequest(
      `Cannot approve an appointment that is already "${appointment.status}"`,
    );
  }

  await recordStatusChange(appointment, AppointmentStatus.APPROVED, userId, {
    adminNote: input.adminNote,
    // Allow admin to assign/update provider at approval time
    providerId:
      input.providerId !== undefined
        ? input.providerId
        : appointment.providerId,
  });

  const updated = await Appointment.findByPk(id, appointmentIncludes);
  return updated!.toJSON();
}

export async function rejectAppointment(
  id: string,
  userId: string,
  roles: string[],
  input: RejectAppointmentInput,
) {
  const appointment = await Appointment.findByPk(id);
  if (!appointment) throw ApiError.notFound("Appointment not found");

  assertCanManage(appointment, userId, roles);

  if (appointment.status !== AppointmentStatus.PENDING) {
    throw ApiError.badRequest(
      `Cannot reject an appointment that is already "${appointment.status}"`,
    );
  }

  await recordStatusChange(appointment, AppointmentStatus.REJECTED, userId, {
    adminNote: input.adminNote,
  });

  const updated = await Appointment.findByPk(id, appointmentIncludes);
  return updated!.toJSON();
}

export async function cancelAppointment(
  id: string,
  userId: string,
  roles: string[],
  input: CancelAppointmentInput,
) {
  const appointment = await Appointment.findByPk(id);
  if (!appointment) throw ApiError.notFound("Appointment not found");

  // ADMIN can cancel any; PROVIDER can cancel their assigned; CLIENT can cancel their own
  if (!roles.includes("ADMIN")) {
    if (roles.includes("PROVIDER")) {
      if (appointment.providerId !== userId) {
        throw ApiError.forbidden(
          "You can only cancel appointments assigned to you",
        );
      }
    } else if (roles.includes("CLIENT")) {
      if (appointment.clientId !== userId) {
        throw ApiError.forbidden("You can only cancel your own appointments");
      }
    } else {
      throw ApiError.forbidden(
        "You do not have permission to cancel this appointment",
      );
    }
  }

  if (appointment.status === AppointmentStatus.COMPLETED) {
    throw ApiError.badRequest("Cannot cancel a completed appointment");
  }

  if (
    appointment.status === AppointmentStatus.CANCELLED ||
    appointment.status === AppointmentStatus.REJECTED
  ) {
    throw ApiError.badRequest(`Appointment is already "${appointment.status}"`);
  }

  await recordStatusChange(appointment, AppointmentStatus.CANCELLED, userId, {
    note: input.note,
  });

  const updated = await Appointment.findByPk(id, appointmentIncludes);
  return updated!.toJSON();
}

export async function completeAppointment(
  id: string,
  userId: string,
  roles: string[],
  input: CompleteAppointmentInput,
) {
  const appointment = await Appointment.findByPk(id);
  if (!appointment) throw ApiError.notFound("Appointment not found");

  assertCanManage(appointment, userId, roles);

  if (appointment.status !== AppointmentStatus.APPROVED) {
    throw ApiError.badRequest(
      `Cannot complete an appointment with status "${appointment.status}". It must be APPROVED first.`,
    );
  }

  await recordStatusChange(appointment, AppointmentStatus.COMPLETED, userId, {
    adminNote: input.adminNote,
  });

  const updated = await Appointment.findByPk(id, appointmentIncludes);
  return updated!.toJSON();
}

export async function getAppointmentHistory(
  id: string,
  userId: string,
  roles: string[],
) {
  const appointment = await Appointment.findByPk(id);
  if (!appointment) throw ApiError.notFound("Appointment not found");

  assertCanView(appointment, userId, roles);

  const history = await AppointmentStatusHistory.findAll({
    where: { appointmentId: id },
    include: [
      {
        model: User,
        as: "changedBy",
        attributes: ["id", "firstName", "lastName", "email"],
      },
    ],
    order: [["createdAt", "ASC"]],
  });

  return history.map((h) => h.toJSON());
}
