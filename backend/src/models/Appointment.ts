import { Model, DataTypes, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { AppointmentStatus } from "../types/enums";

export interface AppointmentAttributes {
  id: string;
  clientId: string;
  providerId?: string | null;
  serviceId: string;
  providerServiceId?: string | null;
  requestedDate: Date;
  requestedTime: string;
  durationMinutes?: number | null;
  sessionType?: string | null;
  location?: string | null;
  meetingLink?: string | null;
  reason?: string | null;
  status: AppointmentStatus;
  adminNote?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AppointmentCreationAttributes extends Optional<
  AppointmentAttributes,
  | "id"
  | "providerId"
  | "providerServiceId"
  | "durationMinutes"
  | "sessionType"
  | "location"
  | "meetingLink"
  | "reason"
  | "status"
  | "adminNote"
  | "createdAt"
  | "updatedAt"
> {}

export class Appointment
  extends Model<AppointmentAttributes, AppointmentCreationAttributes>
  implements AppointmentAttributes
{
  declare id: string;
  declare clientId: string;
  declare providerId: string | null | undefined;
  declare serviceId: string;
  declare providerServiceId: string | null | undefined;
  declare requestedDate: Date;
  declare requestedTime: string;
  declare durationMinutes: number | null | undefined;
  declare sessionType: string | null | undefined;
  declare location: string | null | undefined;
  declare meetingLink: string | null | undefined;
  declare reason: string | null | undefined;
  declare status: AppointmentStatus;
  declare adminNote: string | null | undefined;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Appointment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    providerId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    serviceId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    providerServiceId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    requestedDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    requestedTime: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    durationMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sessionType: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    location: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    meetingLink: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(AppointmentStatus)),
      allowNull: false,
      defaultValue: AppointmentStatus.PENDING,
    },
    adminNote: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "appointments",
    timestamps: true,
  },
);
