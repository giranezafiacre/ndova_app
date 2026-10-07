import { User, Role, UserRole, Service, Appointment } from "../../models";
import { AppointmentStatus } from "../../types/enums";

// ---- Shared include for recent appointment lists ----------------------------

const clientApptIncludes = {
  include: [
    {
      model: User,
      as: "provider",
      attributes: ["id", "firstName", "lastName", "email"],
    },
    { model: Service, as: "service", attributes: ["id", "name"] },
  ],
};

const providerApptIncludes = {
  include: [
    {
      model: User,
      as: "client",
      attributes: ["id", "firstName", "lastName", "email"],
    },
    { model: Service, as: "service", attributes: ["id", "name"] },
  ],
};

const adminApptIncludes = {
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
  ],
};

// ---- Dashboard functions ----------------------------------------------------

export async function getClientDashboard(clientId: string) {
  const [total, pending, approved, rejected, cancelled, completed, recent] =
    await Promise.all([
      Appointment.count({ where: { clientId } }),
      Appointment.count({
        where: { clientId, status: AppointmentStatus.PENDING },
      }),
      Appointment.count({
        where: { clientId, status: AppointmentStatus.APPROVED },
      }),
      Appointment.count({
        where: { clientId, status: AppointmentStatus.REJECTED },
      }),
      Appointment.count({
        where: { clientId, status: AppointmentStatus.CANCELLED },
      }),
      Appointment.count({
        where: { clientId, status: AppointmentStatus.COMPLETED },
      }),
      Appointment.findAll({
        where: { clientId },
        ...clientApptIncludes,
        order: [["createdAt", "DESC"]],
        limit: 5,
      }),
    ]);

  return {
    summary: { total, pending, approved, rejected, cancelled, completed },
    recentAppointments: recent.map((a) => a.toJSON()),
  };
}

export async function getProviderDashboard(providerId: string) {
  const [total, pending, approved, rejected, cancelled, completed, recent] =
    await Promise.all([
      Appointment.count({ where: { providerId } }),
      Appointment.count({
        where: { providerId, status: AppointmentStatus.PENDING },
      }),
      Appointment.count({
        where: { providerId, status: AppointmentStatus.APPROVED },
      }),
      Appointment.count({
        where: { providerId, status: AppointmentStatus.REJECTED },
      }),
      Appointment.count({
        where: { providerId, status: AppointmentStatus.CANCELLED },
      }),
      Appointment.count({
        where: { providerId, status: AppointmentStatus.COMPLETED },
      }),
      Appointment.findAll({
        where: { providerId },
        ...providerApptIncludes,
        order: [["createdAt", "DESC"]],
        limit: 5,
      }),
    ]);

  return {
    summary: { total, pending, approved, rejected, cancelled, completed },
    recentAppointments: recent.map((a) => a.toJSON()),
  };
}

export async function getAdminDashboard() {
  // Look up role IDs once so we can count UserRole rows efficiently
  const [clientRole, providerRole] = await Promise.all([
    Role.findOne({ where: { name: "CLIENT" } }),
    Role.findOne({ where: { name: "PROVIDER" } }),
  ]);

  const [
    totalUsers,
    totalClients,
    totalProviders,
    totalServices,
    totalAppointments,
    pending,
    approved,
    rejected,
    cancelled,
    completed,
    recent,
  ] = await Promise.all([
    User.count(),
    UserRole.count({ where: { roleId: clientRole!.id } }),
    UserRole.count({ where: { roleId: providerRole!.id } }),
    Service.count({ where: { isActive: true } }),
    Appointment.count(),
    Appointment.count({ where: { status: AppointmentStatus.PENDING } }),
    Appointment.count({ where: { status: AppointmentStatus.APPROVED } }),
    Appointment.count({ where: { status: AppointmentStatus.REJECTED } }),
    Appointment.count({ where: { status: AppointmentStatus.CANCELLED } }),
    Appointment.count({ where: { status: AppointmentStatus.COMPLETED } }),
    Appointment.findAll({
      ...adminApptIncludes,
      order: [["createdAt", "DESC"]],
      limit: 5,
    }),
  ]);

  return {
    users: {
      total: totalUsers,
      clients: totalClients,
      providers: totalProviders,
    },
    services: {
      total: totalServices,
    },
    appointments: {
      total: totalAppointments,
      pending,
      approved,
      rejected,
      cancelled,
      completed,
    },
    recentAppointments: recent.map((a) => a.toJSON()),
  };
}
