import { Model, DataTypes, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { AppointmentStatus } from "../types/enums";

export interface AppointmentStatusHistoryAttributes {
  id: string;
  appointmentId: string;
  previousStatus?: AppointmentStatus | null;
  newStatus: AppointmentStatus;
  changedById: string;
  note?: string | null;
  createdAt?: Date;
}

export interface AppointmentStatusHistoryCreationAttributes extends Optional<
  AppointmentStatusHistoryAttributes,
  "id" | "previousStatus" | "note" | "createdAt"
> {}

export class AppointmentStatusHistory
  extends Model<
    AppointmentStatusHistoryAttributes,
    AppointmentStatusHistoryCreationAttributes
  >
  implements AppointmentStatusHistoryAttributes
{
  declare id: string;
  declare appointmentId: string;
  declare previousStatus: AppointmentStatus | null | undefined;
  declare newStatus: AppointmentStatus;
  declare changedById: string;
  declare note: string | null | undefined;
  declare readonly createdAt: Date;
}

AppointmentStatusHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    appointmentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    previousStatus: {
      type: DataTypes.ENUM(...Object.values(AppointmentStatus)),
      allowNull: true,
    },
    newStatus: {
      type: DataTypes.ENUM(...Object.values(AppointmentStatus)),
      allowNull: false,
    },
    changedById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "appointment_status_history",
    timestamps: true,
    updatedAt: false,
  },
);
